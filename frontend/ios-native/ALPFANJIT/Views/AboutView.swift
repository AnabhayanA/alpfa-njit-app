import SwiftUI
import UIKit

struct AboutView: View {
  @EnvironmentObject private var notifications: NotificationManager
  var body: some View {
    ScrollView { VStack(spacing: 18) {
      ALPFALogo().frame(height: 220).clipShape(RoundedRectangle(cornerRadius: 24))
      Text("ALPFA NJIT").font(.largeTitle.black()).foregroundStyle(Brand.ink)
      Text("Building Leaders. Creating Opportunities.").font(.subheadline).foregroundStyle(.secondary)
      InfoPanel(title: "Our Mission", icon: "flag.fill", text: "Empower students through leadership, networking, professional development, and career opportunities.")
      InfoPanel(title: "Get Involved", icon: "sparkles", text: "Attend meetings, connect with peers, and discover ways to lead and participate.")
      Toggle(isOn: Binding(get: { notifications.enabled }, set: { enabled in if enabled { Task { await notifications.requestPermission() } } else { UIApplication.shared.open(URL(string: UIApplication.openSettingsURLString)!) } })) { Label("Notifications", systemImage: "bell.fill") }.padding().background(.white).clipShape(RoundedRectangle(cornerRadius: 16))
      Link("Instagram", destination: URL(string: "https://www.instagram.com/alpfa_njit/")!); Link("LinkedIn", destination: URL(string: "https://www.linkedin.com/in/alpfanjit/")!); Link("Highlander Hub", destination: URL(string: "https://njit.campuslabs.com/engage/organization/alpfa")!); Link("Email ALPFA NJIT", destination: URL(string: "mailto:alpfanjit@gmail.com")!)
      Text("No account is required. Calendar cache and reminder preferences stay on this device.").font(.caption).foregroundStyle(.secondary).padding(.top)
    }.padding(18) }.background(Brand.canvas).navigationTitle("About")
  }
}

private struct InfoPanel: View {
  let title: String; let icon: String; let text: String
  var body: some View { HStack(alignment: .top, spacing: 12) { Image(systemName: icon).foregroundStyle(Brand.burgundy).frame(width: 34, height: 34).background(Brand.burgundy.opacity(0.1)).clipShape(Circle()); VStack(alignment: .leading, spacing: 5) { Text(title).font(.headline); Text(text).font(.subheadline).foregroundStyle(.secondary) }; Spacer() }.padding(16).background(.white).clipShape(RoundedRectangle(cornerRadius: 16)) }
}
