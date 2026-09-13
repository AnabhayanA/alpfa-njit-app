import SwiftUI

private struct Officer: Identifiable {
  let id = UUID(); let name: String; let role: String; let bio: String; let goal: String; let why: String
}

private let officers = [
  Officer(name: "Ingrid Martinez-Rojas", role: "Chapter President", bio: "Business Management student concentrating in Marketing and a first-generation college student.", goal: "Grow membership while building a strong, engaged community.", why: "ALPFA creates confidence, meaningful connections, and successful careers."),
  Officer(name: "Andrea Camila Pardo", role: "Vice President", bio: "Ecuadorian Data Science student, EOP and McNair scholar.", goal: "Grow membership while preserving ALPFA's family spirit.", why: "ALPFA became my family and provides a supportive community."),
  Officer(name: "Anwesha Biswal", role: "Secretary", bio: "Business student, former FBLA leader, and mentor focused on empowering others.", goal: "Create a strong foundation and help the chapter run smoothly.", why: "ALPFA is a welcoming community where I can support others."),
  Officer(name: "Anabhayan Ahruran", role: "Director of IT", bio: "Sri Lankan and Malaysian technologist focused on building welcoming student experiences.", goal: "Help students build confidence, networks, and career connections.", why: "ALPFA helped me build meaningful relationships with students and professionals."),
  Officer(name: "Renzo Rey", role: "Director of Professional Development", bio: "Mechanical Engineering student passionate about helping others grow.", goal: "Develop confident members and leaders who support one another.", why: "ALPFA gives me the opportunity to help others recognize their potential."),
  Officer(name: "Brandon Palacios", role: "Director of Marketing Operations", bio: "Marketing student bringing luxury retail operations and brand strategy experience.", goal: "Strengthen ALPFA NJIT's brand consistency and visibility.", why: "ALPFA combines marketing, operations, and community-building."),
  Officer(name: "Jose Trujillo", role: "Director of Fundraising", bio: "Fintech student who enjoys working with people toward shared goals.", goal: "Build alumni, professional, business, and chapter partnerships.", why: "ALPFA creates relationships across students and professionals.")
]

struct EBoardView: View {
  var body: some View {
    ScrollView { LazyVStack(spacing: 14) { ForEach(officers) { FlipOfficerCard(officer: $0) } }.padding() }
      .background(Brand.canvas).navigationTitle("Meet the E-Board")
  }
}

private struct FlipOfficerCard: View {
  let officer: Officer; @State private var flipped = false
  var body: some View {
    ZStack {
      RoundedRectangle(cornerRadius: 20).fill(.white).shadow(color: .black.opacity(0.08), radius: 9, y: 4)
      if flipped {
        VStack(alignment: .leading, spacing: 9) { Label("BIO", systemImage: "person.text.rectangle").font(.caption.bold()).foregroundStyle(Brand.burgundy); Text(officer.bio); Text("GOAL").font(.caption.bold()).foregroundStyle(Brand.burgundy); Text(officer.goal); Text("WHY ALPFA").font(.caption.bold()).foregroundStyle(Brand.burgundy); Text(officer.why); Spacer(); Text("Tap to return").font(.caption2).foregroundStyle(.secondary) }.font(.caption).padding(18)
      } else {
        HStack(spacing: 14) { Circle().fill(Brand.burgundy.opacity(0.12)).frame(width: 66, height: 66).overlay(Text(officer.name.split(separator: " ").compactMap(\.first).prefix(2).map(String.init).joined()).font(.headline.bold()).foregroundStyle(Brand.burgundy)); VStack(alignment: .leading) { Text(officer.name).font(.headline).foregroundStyle(Brand.ink); Text(officer.role).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.burgundy); Text("Tap for bio, goal & why ALPFA").font(.caption2).foregroundStyle(.secondary).padding(.top, 5) }; Spacer(); Image(systemName: "arrow.triangle.2.circlepath") }.padding(18)
      }
    }.frame(minHeight: flipped ? 250 : 112).rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (0,1,0)).overlay { Color.clear.contentShape(Rectangle()).onTapGesture { withAnimation(.spring(response: 0.55, dampingFraction: 0.78)) { flipped.toggle() } } }.rotation3DEffect(.degrees(flipped ? 180 : 0), axis: (0,1,0))
  }
}

