import SwiftUI

struct HomeView: View {
  @EnvironmentObject private var calendar: CalendarStore
  @State private var showCamera = false

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 18) {
        HStack(alignment: .top) {
          VStack(alignment: .leading, spacing: 0) {
            Text("WELCOME BACK,").font(.caption.bold()).tracking(1.4).foregroundStyle(Brand.ink.opacity(0.7))
            Text("Familia").font(.system(size: 35, weight: .black, design: .rounded)).foregroundStyle(Brand.burgundy)
          }
          Spacer(); ALPFALogo().frame(width: 76, height: 76).clipShape(RoundedRectangle(cornerRadius: 15))
        }

        if let event = calendar.nextEvent {
          NavigationLink(value: event) { NextEventBanner(event: event) }.buttonStyle(.plain)
        } else {
          EmptyEventBanner(isLoading: calendar.isLoading)
        }

        Text("QUICK LINKS").font(.caption2.bold()).tracking(1.6).foregroundStyle(.secondary)
        LazyVGrid(columns: [.init(.flexible()), .init(.flexible())], spacing: 10) {
          NavigationLink { EventsView() } label: { QuickLink(title: "Events", icon: "calendar", color: Brand.burgundy) }.buttonStyle(.plain)
          NavigationLink { EBoardView() } label: { QuickLink(title: "E-Board", icon: "person.3.fill", color: .blue) }.buttonStyle(.plain)
          NavigationLink { AboutView() } label: { QuickLink(title: "About", icon: "doc.text.fill", color: Brand.gold) }.buttonStyle(.plain)
          Link(destination: URL(string: "https://njit.campuslabs.com/engage/organization/alpfa")!) { QuickLink(title: "Join", icon: "person.badge.plus", color: .green) }
          Button { showCamera = true } label: { QuickLink(title: "Share a Photo", icon: "camera.fill", color: .purple) }.buttonStyle(.plain)
          Link(destination: URL(string: "https://nonnair.github.io/alpfa-njit/")!) { QuickLink(title: "Website", icon: "arrow.up.right.square.fill", color: .orange) }
        }

        VStack(alignment: .leading, spacing: 5) {
          Text("MORE LATINOS.").font(.caption2.bold()).tracking(2)
          Text("BRIGHTER TOMORROWS.").font(.caption2.bold()).tracking(2).foregroundStyle(Brand.burgundy)
          Text("People • Opportunity • Community • Impact").font(.caption2).foregroundStyle(.secondary)
        }.padding(.top, 12)
      }.padding(18)
    }
    .background(Brand.canvas)
    .navigationDestination(for: CalendarEvent.self) { EventDetailView(event: $0) }
    .sheet(isPresented: $showCamera) { CameraScreen() }
    .refreshable { await calendar.refresh() }
  }
}

private struct NextEventBanner: View {
  let event: CalendarEvent
  var body: some View {
    ZStack {
      LinearGradient(colors: [Brand.ink, Brand.navy, Brand.burgundy.opacity(0.95)], startPoint: .topLeading, endPoint: .bottomTrailing)
      BrandShard(leading: false).fill(Brand.red.opacity(0.75)).frame(width: 190, height: 125).offset(x: 115, y: -55)
      HStack(spacing: 14) {
        VStack(spacing: 2) {
          Text(event.start.formatted(.dateTime.month(.abbreviated))).font(.caption2.bold())
          Text(event.start.formatted(.dateTime.day())).font(.title.bold())
          Text(event.start.formatted(.dateTime.hour().minute())).font(.caption2)
        }.frame(width: 62, height: 80).background(Brand.burgundy).clipShape(RoundedRectangle(cornerRadius: 14))
        VStack(alignment: .leading, spacing: 6) {
          Text("NEXT EVENT  •  \(event.timingLabel)").font(.caption2.bold()).tracking(1.2).foregroundStyle(.white.opacity(0.67))
          Text(event.title).font(.headline.bold()).lineLimit(2)
          Label(event.location, systemImage: "mappin.and.ellipse").font(.caption).lineLimit(1).foregroundStyle(.white.opacity(0.78))
        }
        Spacer(); Image(systemName: "chevron.right").font(.caption.bold()).padding(10).background(Brand.burgundy).clipShape(Circle())
      }.foregroundStyle(.white).padding(14)
    }.frame(minHeight: 145).clipShape(RoundedRectangle(cornerRadius: 18)).shadow(color: Brand.ink.opacity(0.2), radius: 12, y: 6)
  }
}

private struct EmptyEventBanner: View {
  let isLoading: Bool
  var body: some View {
    HStack { Image(systemName: isLoading ? "arrow.triangle.2.circlepath" : "calendar.badge.clock"); VStack(alignment: .leading) { Text(isLoading ? "Finding the next event…" : "More events coming soon").font(.headline); Text("Check the Events tab for chapter updates.").font(.caption).foregroundStyle(.secondary) }; Spacer() }
      .padding(18).background(.white).clipShape(RoundedRectangle(cornerRadius: 18))
  }
}

private struct QuickLink: View {
  let title: String; let icon: String; let color: Color
  var body: some View { HStack { Image(systemName: icon).foregroundStyle(color).frame(width: 30, height: 30).background(color.opacity(0.12)).clipShape(Circle()); Text(title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.ink); Spacer(); Image(systemName: "chevron.right").font(.caption).foregroundStyle(.secondary) }.padding(11).background(.white).clipShape(RoundedRectangle(cornerRadius: 13)) }
}
