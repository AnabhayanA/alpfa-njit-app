import AVFoundation
import SwiftUI

struct CameraScreen: View {
  @Environment(\.dismiss) private var dismiss
  @StateObject private var camera = CameraController()
  @State private var preview: Data?
  @State private var uploading = false
  var body: some View {
    ZStack {
      Color.black.ignoresSafeArea()
      if let preview, let image = UIImage(data: preview) { Image(uiImage: image).resizable().scaledToFill().ignoresSafeArea() }
      else { CameraPreview(session: camera.session).ignoresSafeArea() }
      VStack { HStack { Button { dismiss() } label: { Image(systemName: "xmark").padding(12).background(.black.opacity(0.45)).clipShape(Circle()) }; Spacer() }.foregroundStyle(.white).padding(); Spacer(); if let preview { HStack { Button("Retake") { self.preview = nil; camera.start() }; Spacer(); Button(uploading ? "Sending…" : "Share to Drive") { uploading = true; Task { try? await PhotoUploadService.upload(jpeg: preview); uploading = false } }.disabled(uploading) }.buttonStyle(.borderedProminent).padding(24) } else { Button { camera.capture { preview = $0 } } label: { Circle().fill(.white).frame(width: 72, height: 72).overlay(Circle().stroke(Brand.burgundy, lineWidth: 5)) }.padding(.bottom, 30) } }
    }.task { await camera.authorizeAndStart() }.onDisappear { camera.stop() }
  }
}

private struct CameraPreview: UIViewRepresentable {
  let session: AVCaptureSession
  func makeUIView(context: Context) -> PreviewView { let view = PreviewView(); view.layerView.session = session; view.layerView.videoGravity = .resizeAspectFill; return view }
  func updateUIView(_ view: PreviewView, context: Context) { view.layerView.session = session }
}
private final class PreviewView: UIView { override class var layerClass: AnyClass { AVCaptureVideoPreviewLayer.self }; var layerView: AVCaptureVideoPreviewLayer { layer as! AVCaptureVideoPreviewLayer } }

@MainActor
private final class CameraController: NSObject, ObservableObject, AVCapturePhotoCaptureDelegate {
  let session = AVCaptureSession(); private let output = AVCapturePhotoOutput(); private var completion: ((Data?) -> Void)?
  func authorizeAndStart() async { if AVCaptureDevice.authorizationStatus(for: .video) == .notDetermined { _ = await AVCaptureDevice.requestAccess(for: .video) }; configure(); start() }
  private func configure() { guard session.inputs.isEmpty, let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back), let input = try? AVCaptureDeviceInput(device: device) else { return }; session.beginConfiguration(); if session.canAddInput(input) { session.addInput(input) }; if session.canAddOutput(output) { session.addOutput(output) }; session.commitConfiguration() }
  func start() { let session = session; DispatchQueue.global(qos: .userInitiated).async { if !session.isRunning { session.startRunning() } } }
  func stop() { let session = session; DispatchQueue.global(qos: .utility).async { if session.isRunning { session.stopRunning() } } }
  func capture(completion: @escaping (Data?) -> Void) { self.completion = completion; output.capturePhoto(with: AVCapturePhotoSettings(), delegate: self) }
  nonisolated func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) { let data = photo.fileDataRepresentation(); Task { @MainActor in self.completion?(data); self.stop() } }
}
