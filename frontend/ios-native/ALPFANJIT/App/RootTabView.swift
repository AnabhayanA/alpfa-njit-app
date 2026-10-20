import SwiftUI

struct RootTabView: View {
  var body: some View {
    TabView {
      NavigationStack { HomeView() }.tabItem { Label("Home", systemImage: "house.fill") }
      NavigationStack { EventsView() }.tabItem { Label("Events", systemImage: "calendar") }
      NavigationStack { EBoardView() }.tabItem { Label("E-Board", systemImage: "person.3.fill") }
      NavigationStack { AboutView() }.tabItem { Label("About", systemImage: "info.circle.fill") }
    }
    .toolbarBackground(.ultraThinMaterial, for: .tabBar)
    .toolbarBackgroundVisibility(.visible, for: .tabBar)
  }
}

