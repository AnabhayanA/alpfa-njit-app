import Foundation

enum PhotoUploadService {
  // Configure this through an xcconfig before distribution. Never commit a service credential.
  static var endpoint: URL? { Bundle.main.object(forInfoDictionaryKey: "PHOTO_UPLOAD_ENDPOINT").flatMap { URL(string: $0 as? String ?? "") } }

  static func upload(jpeg: Data) async throws {
    guard let endpoint else { throw URLError(.badURL) }
    let boundary = UUID().uuidString
    var request = URLRequest(url: endpoint); request.httpMethod = "POST"; request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
    var body = Data(); body.append("--\(boundary)\r\nContent-Disposition: form-data; name=\"photo\"; filename=\"alpfa-njit.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n".data(using: .utf8)!); body.append(jpeg); body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
    let (_, response) = try await URLSession.shared.upload(for: request, from: body)
    guard ((response as? HTTPURLResponse)?.statusCode ?? 500) < 300 else { throw URLError(.badServerResponse) }
  }
}
