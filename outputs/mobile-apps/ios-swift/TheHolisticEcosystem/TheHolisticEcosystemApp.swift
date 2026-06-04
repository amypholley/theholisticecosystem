import SwiftUI

@main
struct TheHolisticEcosystemApp: App {
    var body: some Scene {
        WindowGroup {
            WebView()
                .ignoresSafeArea(edges: .bottom)
        }
    }
}
