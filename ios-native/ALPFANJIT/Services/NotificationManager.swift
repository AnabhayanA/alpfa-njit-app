import Foundation
import UserNotifications
import UIKit

@MainActor
final class NotificationManager: ObservableObject {
  @Published private(set) var enabled = false

  init() { Task { await refreshAuthorization() } }

  func requestPermission() async {
    enabled = (try? await UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound])) ?? false
    if enabled { UIApplication.shared.registerForRemoteNotifications() }
  }

  func refreshAuthorization() async {
    enabled = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus == .authorized
  }

  func scheduleReminder(for event: CalendarEvent) async throws {
    if !enabled { await requestPermission() }
    guard enabled else { return }
    let content = UNMutableNotificationContent(); content.title = "📅 \(event.title) starts soon"; content.body = event.location; content.sound = .default; content.userInfo = ["eventId": event.id]
    let fire = max(event.start.addingTimeInterval(-3600), .now.addingTimeInterval(5))
    let trigger = UNCalendarNotificationTrigger(dateMatching: Calendar.current.dateComponents([.year,.month,.day,.hour,.minute], from: fire), repeats: false)
    try await UNUserNotificationCenter.current().add(UNNotificationRequest(identifier: "event-\(event.id)", content: content, trigger: trigger))
  }
}
