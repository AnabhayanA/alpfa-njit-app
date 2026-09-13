import SwiftUI

struct SplashView: View {
  let completion: () -> Void
  @State private var logoScale = 0.72
  @State private var logoOpacity = 0.0
  @State private var leftOffset = -420.0
  @State private var rightOffset = 420.0
  @State private var progress = 0.0
  @State private var shimmer = -260.0

  var body: some View {
    GeometryReader { proxy in
      ZStack {
        Brand.canvas.ignoresSafeArea()
        BrandShard(leading: true).fill(Brand.navy).frame(width: proxy.size.width * 0.72, height: 220).offset(x: leftOffset, y: -proxy.size.height * 0.28)
        BrandShard(leading: false).fill(Brand.burgundy).frame(width: proxy.size.width * 0.72, height: 220).offset(x: rightOffset, y: proxy.size.height * 0.3)

        ALPFALogo().frame(width: min(proxy.size.width * 0.72, 310), height: 310)
          .scaleEffect(logoScale).opacity(logoOpacity)
          .overlay {
            LinearGradient(colors: [.clear, Brand.gold.opacity(0.55), .clear], startPoint: .top, endPoint: .bottom)
              .frame(width: 44).rotationEffect(.degrees(18)).offset(x: shimmer).mask(ALPFALogo())
          }

        VStack {
          Spacer()
          Text("LEAD  •  CONNECT  •  BELONG  •  GROW").font(.caption2.weight(.semibold)).tracking(1.35).foregroundStyle(Brand.ink.opacity(0.72))
          GeometryReader { bar in
            Capsule().fill(Brand.ink.opacity(0.12)).overlay(alignment: .leading) { Capsule().fill(Brand.burgundy).frame(width: bar.size.width * progress) }
          }.frame(height: 3).padding(.horizontal, 28).padding(.bottom, 12)
        }
      }
      .onAppear {
        withAnimation(.spring(response: 0.85, dampingFraction: 0.82)) { leftOffset = -proxy.size.width * 0.25; rightOffset = proxy.size.width * 0.25 }
        withAnimation(.easeOut(duration: 0.75).delay(0.2)) { logoScale = 1; logoOpacity = 1 }
        withAnimation(.easeInOut(duration: 1.25).delay(0.55)) { shimmer = 260 }
        withAnimation(.easeInOut(duration: 2.1)) { progress = 1 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.35) { withAnimation(.easeOut(duration: 0.35)) { completion() } }
      }
    }
  }
}

