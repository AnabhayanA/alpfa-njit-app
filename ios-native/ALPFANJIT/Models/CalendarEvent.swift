import Foundation

struct CalendarEvent: Identifiable, Hashable, Codable {
  let id: String
  let title: String
  let start: Date
  let end: Date?
  let location: String
  let details: String
  let url: URL?

  var timingLabel: String {
    if Calendar.current.isDateInToday(start) { return "TODAY" }
    if Calendar.current.isDateInTomorrow(start) { return "TOMORROW" }
    return start.formatted(.dateTime.month(.abbreviated).day())
  }
}

