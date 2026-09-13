import SwiftUI

@main
struct ALPFANJITApp: App {
  @StateObject private var calendar = CalendarStore()
  @StateObject private var notifications = NotificationManager()
  @State private var showingSplash = true

  var body: some Scene {
    WindowGroup {
      ZStack {
        RootTabView()
          .environmentObject(calendar)
          .environmentObject(notifications)
        if showingSplash {
          SplashView { showingSplash = false }
            .transition(.opacity)
            .zIndex(10)
        }
      }
      .task { await calendar.refresh() }
      .tint(Brand.burgundy)
    }
  }
}

