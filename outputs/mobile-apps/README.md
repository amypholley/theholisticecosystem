# The Holistic Ecosystem Mobile Apps

This folder contains starter native app shells for both mobile platforms:

- `android-kotlin`: Android app starter written in Kotlin.
- `ios-swift`: iOS app starter written in Swift.

Both versions are set up as simple WebView apps. After the website is published,
replace the placeholder website URL in each app with the live website address.

## Android Kotlin

Open `android-kotlin` in Android Studio.

Update this line in `android-kotlin/app/src/main/java/com/theholisticecosystem/app/MainActivity.kt`:

```kotlin
private const val WEBSITE_URL = "https://example.com"
```

Use your real website URL, such as a GitHub Pages URL.

## iOS Swift

Create a new iOS SwiftUI app in Xcode named `TheHolisticEcosystem`, then add
the Swift files from `ios-swift/TheHolisticEcosystem` to that project.

Update this line in `ios-swift/TheHolisticEcosystem/WebView.swift`:

```swift
private let websiteURL = URL(string: "https://example.com")!
```

Use your real website URL.

## Store Notes

Apple and Google may ask for the app to offer more than only a website wrapper.
Good next additions would be:

- Podcast links.
- Blog reader.
- Saved favorite health resources.
- Push notifications for new blog posts.
- Contact or coaching inquiry form.
