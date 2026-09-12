import AVFoundation
import CoreImage
import ExpoModulesCore
import UIKit

private final class CameraFrameDelegate: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate {
  private let lock = NSLock()
  private var latestBuffer: CVPixelBuffer?

  func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
    guard let buffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
    lock.lock()
    latestBuffer = buffer
    lock.unlock()
  }

  func currentBuffer() -> CVPixelBuffer? {
    lock.lock()
    defer { lock.unlock() }
    return latestBuffer
  }
}

public final class AlpfaDualCameraView: ExpoView {
  private let session = AVCaptureMultiCamSession()
  private let sessionQueue = DispatchQueue(label: "org.alpfanjit.dualcamera.session")
  private let rearFrameDelegate = CameraFrameDelegate()
  private let frontFrameDelegate = CameraFrameDelegate()
  private let rearOutput = AVCaptureVideoDataOutput()
  private let frontOutput = AVCaptureVideoDataOutput()
  private var rearPreviewLayer: AVCaptureVideoPreviewLayer?
  private var frontPreviewLayer: AVCaptureVideoPreviewLayer?
  private var configured = false

  let onReady = EventDispatcher()
  let onError = EventDispatcher()

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    backgroundColor = .black
    clipsToBounds = true
    sessionQueue.async { [weak self] in self?.configureAndStart() }
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    CATransaction.begin()
    CATransaction.setDisableActions(true)
    rearPreviewLayer?.frame = bounds
    let width = min(bounds.width * 0.31, 150)
    frontPreviewLayer?.frame = CGRect(x: 16, y: 16, width: width, height: width * 4 / 3)
    frontPreviewLayer?.cornerRadius = 14
    CATransaction.commit()
  }

  public override func didMoveToWindow() {
    super.didMoveToWindow()
    sessionQueue.async { [weak self] in
      guard let self else { return }
      if self.window == nil {
        if self.session.isRunning { self.session.stopRunning() }
      } else if self.configured && !self.session.isRunning {
        self.session.startRunning()
      }
    }
  }

  func captureComposite(promise: Promise) {
    guard let rearBuffer = rearFrameDelegate.currentBuffer(), let frontBuffer = frontFrameDelegate.currentBuffer() else {
      promise.reject("E_CAMERA_NOT_READY", "Both cameras are still starting. Please try again.")
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let rearImage = UIImage(ciImage: CIImage(cvPixelBuffer: rearBuffer))
        let frontImage = UIImage(ciImage: CIImage(cvPixelBuffer: frontBuffer))
        let size = CGSize(width: 1080, height: 1440)
        let composite = UIGraphicsImageRenderer(size: size).image { context in
          UIColor.black.setFill()
          context.cgContext.fill(CGRect(origin: .zero, size: size))
          self.drawAspectFill(rearImage, in: CGRect(origin: .zero, size: size))
          let inset = CGRect(x: 48, y: 48, width: 324, height: 432)
          let path = UIBezierPath(roundedRect: inset, cornerRadius: 36)
          context.cgContext.saveGState()
          path.addClip()
          self.drawAspectFill(frontImage, in: inset)
          context.cgContext.restoreGState()
          UIColor.white.setStroke()
          path.lineWidth = 8
          path.stroke()
        }
        guard let data = composite.jpegData(compressionQuality: 0.88) else { throw CameraSetupError.encodeFailed }
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("alpfa-dual-\(UUID().uuidString).jpg")
        try data.write(to: url, options: .atomic)
        promise.resolve(["uri": url.absoluteString])
      } catch {
        promise.reject("E_CAPTURE_FAILED", error.localizedDescription)
      }
    }
  }

  private func configureAndStart() {
    guard AVCaptureMultiCamSession.isMultiCamSupported else {
      reportError("This iPhone does not support simultaneous front and rear cameras.")
      return
    }
    do {
      session.beginConfiguration()
      defer { session.commitConfiguration() }
      guard let rearDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
            let frontDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front) else { throw CameraSetupError.missingCamera }
      let rearInput = try AVCaptureDeviceInput(device: rearDevice)
      let frontInput = try AVCaptureDeviceInput(device: frontDevice)
      guard session.canAddInput(rearInput), session.canAddInput(frontInput) else { throw CameraSetupError.cannotAddInput }
      session.addInputWithNoConnections(rearInput)
      session.addInputWithNoConnections(frontInput)
      guard let rearPort = rearInput.ports.first(where: { $0.mediaType == .video }),
            let frontPort = frontInput.ports.first(where: { $0.mediaType == .video }) else { throw CameraSetupError.missingPort }

      let rearLayer = AVCaptureVideoPreviewLayer(sessionWithNoConnection: session)
      let frontLayer = AVCaptureVideoPreviewLayer(sessionWithNoConnection: session)
      rearLayer.videoGravity = .resizeAspectFill
      frontLayer.videoGravity = .resizeAspectFill
      frontLayer.borderColor = UIColor.white.cgColor
      frontLayer.borderWidth = 2
      frontLayer.masksToBounds = true
      let rearPreview = AVCaptureConnection(inputPort: rearPort, videoPreviewLayer: rearLayer)
      let frontPreview = AVCaptureConnection(inputPort: frontPort, videoPreviewLayer: frontLayer)
      configure(rearPreview, mirrored: false)
      configure(frontPreview, mirrored: true)
      guard session.canAddConnection(rearPreview), session.canAddConnection(frontPreview) else { throw CameraSetupError.cannotAddConnection }
      session.addConnection(rearPreview)
      session.addConnection(frontPreview)

      rearOutput.alwaysDiscardsLateVideoFrames = true
      frontOutput.alwaysDiscardsLateVideoFrames = true
      rearOutput.setSampleBufferDelegate(rearFrameDelegate, queue: DispatchQueue(label: "org.alpfanjit.dualcamera.rear"))
      frontOutput.setSampleBufferDelegate(frontFrameDelegate, queue: DispatchQueue(label: "org.alpfanjit.dualcamera.front"))
      guard session.canAddOutput(rearOutput), session.canAddOutput(frontOutput) else { throw CameraSetupError.cannotAddOutput }
      session.addOutputWithNoConnections(rearOutput)
      session.addOutputWithNoConnections(frontOutput)
      let rearData = AVCaptureConnection(inputPorts: [rearPort], output: rearOutput)
      let frontData = AVCaptureConnection(inputPorts: [frontPort], output: frontOutput)
      configure(rearData, mirrored: false)
      configure(frontData, mirrored: true)
      guard session.canAddConnection(rearData), session.canAddConnection(frontData) else { throw CameraSetupError.cannotAddConnection }
      session.addConnection(rearData)
      session.addConnection(frontData)

      DispatchQueue.main.async {
        self.layer.insertSublayer(rearLayer, at: 0)
        self.layer.addSublayer(frontLayer)
        self.rearPreviewLayer = rearLayer
        self.frontPreviewLayer = frontLayer
        self.setNeedsLayout()
      }
      configured = true
      session.startRunning()
      DispatchQueue.main.async { self.onReady([:]) }
    } catch { reportError(error.localizedDescription) }
  }

  private func configure(_ connection: AVCaptureConnection, mirrored: Bool) {
    if connection.isVideoRotationAngleSupported(90) { connection.videoRotationAngle = 90 }
    if connection.isVideoMirroringSupported {
      connection.automaticallyAdjustsVideoMirroring = false
      connection.isVideoMirrored = mirrored
    }
  }

  private func drawAspectFill(_ image: UIImage, in rect: CGRect) {
    let scale = max(rect.width / image.size.width, rect.height / image.size.height)
    let size = CGSize(width: image.size.width * scale, height: image.size.height * scale)
    image.draw(in: CGRect(x: rect.midX - size.width / 2, y: rect.midY - size.height / 2, width: size.width, height: size.height))
  }

  private func reportError(_ message: String) {
    DispatchQueue.main.async { self.onError(["message": message]) }
  }
}

private enum CameraSetupError: LocalizedError {
  case missingCamera, cannotAddInput, missingPort, cannotAddOutput, cannotAddConnection, encodeFailed
  var errorDescription: String? {
    switch self {
    case .missingCamera: return "Front or rear camera is unavailable."
    case .cannotAddInput: return "The camera inputs cannot run together on this iPhone."
    case .missingPort: return "A camera video connection is unavailable."
    case .cannotAddOutput: return "The camera outputs cannot run together on this iPhone."
    case .cannotAddConnection: return "The dual-camera connection could not be created."
    case .encodeFailed: return "Could not create the photo."
    }
  }
}

public class AlpfaDualCameraModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AlpfaDualCamera")
    Function("isSupported") { AVCaptureMultiCamSession.isMultiCamSupported }
    View(AlpfaDualCameraView.self) {
      Events("onReady", "onError")
      AsyncFunction("capture") { (view: AlpfaDualCameraView, promise: Promise) in view.captureComposite(promise: promise) }
    }
  }
}
