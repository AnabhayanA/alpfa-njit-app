import SwiftUI

enum Brand {
  static let navy = Color(red: 15/255, green: 16/255, blue: 46/255)
  static let burgundy = Color(red: 110/255, green: 27/255, blue: 45/255)
  static let red = Color(red: 202/255, green: 31/255, blue: 48/255)
  static let gold = Color(red: 201/255, green: 151/255, blue: 49/255)
  static let canvas = Color(red: 248/255, green: 246/255, blue: 242/255)
  static let ink = Color(red: 8/255, green: 28/255, blue: 55/255)
}

struct ALPFALogo: View {
  var contentMode: ContentMode = .fit
  var body: some View {
    Image("ALPFANJITLogo").resizable().aspectRatio(contentMode: contentMode)
      .accessibilityLabel("ALPFA NJIT")
  }
}

struct BrandShard: Shape {
  var leading: Bool
  func path(in rect: CGRect) -> Path {
    var path = Path()
    if leading {
      path.move(to: CGPoint(x: 0, y: rect.minY)); path.addLine(to: CGPoint(x: rect.maxX, y: rect.midY));
      path.addLine(to: CGPoint(x: 0, y: rect.maxY))
    } else {
      path.move(to: CGPoint(x: rect.maxX, y: rect.minY)); path.addLine(to: CGPoint(x: 0, y: rect.midY));
      path.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
    }
    path.closeSubpath(); return path
  }
}

