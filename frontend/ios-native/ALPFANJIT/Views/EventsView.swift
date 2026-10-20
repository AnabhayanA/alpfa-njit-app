import SwiftUI

struct EventsView: View {
  @EnvironmentObject private var calendar: CalendarStore
  var body: some View {
    Group {
      if calendar.events.isEmpty && calendar.isLoading { ProgressView("Loading events…") }
      else if calendar.events.isEmpty { ContentUnavailableView("No upcoming events", systemImage: "calendar", description: Text(calendar.errorMessage ?? "New events will appear here.")) }
      else { List(calendar.events) { event in NavigationLink(value: event) { EventRow(event: event) } }.listStyle(.plain).refreshable { await calendar.refresh() } }
    }
    .navigationTitle("Events")
    .navigationDestination(for: CalendarEvent.self) { EventDetailView(event: $0) }
  }
}

private struct EventRow: View {
  let event: CalendarEvent
  var body: some View { HStack(spacing: 14) { VStack { Text(event.start.formatted(.dateTime.month(.abbreviated))).font(.caption.bold()).foregroundStyle(Brand.burgundy); Text(event.start.formatted(.dateTime.day())).font(.title2.bold()).foregroundStyle(Brand.ink) }.frame(width: 58, height: 64).background(Brand.burgundy.opacity(0.08)).clipShape(RoundedRectangle(cornerRadius: 12)); VStack(alignment: .leading, spacing: 5) { Text(event.title).font(.headline).foregroundStyle(Brand.ink); Label(event.start.formatted(date: .omitted, time: .shortened), systemImage: "clock").font(.caption).foregroundStyle(.secondary); Label(event.location, systemImage: "mappin.and.ellipse").font(.caption).foregroundStyle(.secondary).lineLimit(1) } }.padding(.vertical, 5) }
}

struct EventDetailView: View {
  @EnvironmentObject private var notifications: NotificationManager
  let event: CalendarEvent
  @State private var reminderSet = false
  var body: some View {
    ScrollView { VStack(alignment: .leading, spacing: 20) { Text(event.title).font(.largeTitle.bold()).foregroundStyle(Brand.ink); Label(event.start.formatted(date: .complete, time: .shortened), systemImage: "calendar"); Label(event.location, systemImage: "mappin.and.ellipse"); if !event.details.isEmpty { Divider(); Text(event.details) }; Button { Task { try? await notifications.scheduleReminder(for: event); reminderSet = notifications.enabled } } label: { Label(reminderSet ? "Reminder Set" : "Remind Me", systemImage: reminderSet ? "bell.fill" : "bell") }.buttonStyle(.borderedProminent); if let url = event.url { Link("Open event page", destination: url) } }.frame(maxWidth: .infinity, alignment: .leading).padding(20) }
    .navigationTitle("Event Details").navigationBarTitleDisplayMode(.inline)
  }
}
