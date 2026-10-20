import Foundation

@MainActor
final class CalendarStore: ObservableObject {
  @Published private(set) var events: [CalendarEvent] = []
  @Published private(set) var isLoading = false
  @Published var errorMessage: String?

  // Keep this URL aligned with the public calendar currently used by the Expo app.
  private let feedURL = URL(string: "https://calendar.google.com/calendar/ical/alpfanjit%40gmail.com/public/basic.ics")!
  private let cacheKey = "cachedCalendarEvents"

  var nextEvent: CalendarEvent? { events.first(where: { ($0.end ?? $0.start) >= .now }) }

  init() { loadCache() }

  func refresh() async {
    isLoading = true; defer { isLoading = false }
    do {
      let (data, response) = try await URLSession.shared.data(from: feedURL)
      guard (response as? HTTPURLResponse)?.statusCode == 200,
            let text = String(data: data, encoding: .utf8) else { throw URLError(.badServerResponse) }
      events = ICSParser.parse(text).filter { ($0.end ?? $0.start) >= .now }.sorted { $0.start < $1.start }
      if let encoded = try? JSONEncoder().encode(events) { UserDefaults.standard.set(encoded, forKey: cacheKey) }
      errorMessage = nil
    } catch {
      errorMessage = events.isEmpty ? "Events are temporarily unavailable." : nil
    }
  }

  private func loadCache() {
    guard let data = UserDefaults.standard.data(forKey: cacheKey),
          let cached = try? JSONDecoder().decode([CalendarEvent].self, from: data) else { return }
    events = cached.filter { ($0.end ?? $0.start) >= .now }
  }
}

enum ICSParser {
  static func parse(_ source: String) -> [CalendarEvent] {
    let unfolded = source.replacingOccurrences(of: "\r\n ", with: "").replacingOccurrences(of: "\r\n", with: "\n")
    return unfolded.components(separatedBy: "BEGIN:VEVENT").dropFirst().compactMap { block in
      let values = Dictionary(uniqueKeysWithValues: block.split(separator: "\n").compactMap { line -> (String, String)? in
        guard let colon = line.firstIndex(of: ":") else { return nil }
        return (String(line[..<colon]).components(separatedBy: ";")[0], String(line[line.index(after: colon)...]))
      })
      guard let uid = values["UID"], let title = values["SUMMARY"], let rawStart = values["DTSTART"], let start = date(rawStart) else { return nil }
      return CalendarEvent(id: uid, title: clean(title), start: start, end: values["DTEND"].flatMap(date), location: clean(values["LOCATION"] ?? "Location to be announced"), details: clean(values["DESCRIPTION"] ?? ""), url: values["URL"].flatMap(URL.init(string:)))
    }
  }

  private static func date(_ value: String) -> Date? {
    for format in ["yyyyMMdd'T'HHmmss'Z'", "yyyyMMdd'T'HHmmss", "yyyyMMdd"] {
      let parser = DateFormatter(); parser.locale = Locale(identifier: "en_US_POSIX"); parser.timeZone = format.hasSuffix("'Z'") ? TimeZone(secondsFromGMT: 0) : TimeZone(identifier: "America/New_York"); parser.dateFormat = format
      if let result = parser.date(from: value) { return result }
    }
    return nil
  }

  private static func clean(_ value: String) -> String {
    value.replacingOccurrences(of: "\\n", with: "\n").replacingOccurrences(of: "\\,", with: ",").replacingOccurrences(of: "\\;", with: ";")
  }
}
