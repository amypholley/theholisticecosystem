# The Holistic Ecosystem Mobile Apps

This folder contains native app shells for both mobile platforms:

- `android-kotlin`: Android app starter written in Kotlin.
- `ios-swift`: iOS app starter written in Swift.

Both versions are set up as WebView apps that bundle the website files directly
inside the app. That means the app can show the same pages, images, colors, and
links even before the website is published online.

## Android Kotlin

Open `android-kotlin` in Android Studio. The website files are bundled at:

```text
android-kotlin/app/src/main/assets/site
```

Build a release app bundle with Android Studio when you are ready to upload to
Google Play Console.

## iOS Swift

Create a new iOS SwiftUI app in Xcode named `TheHolisticEcosystem`, then add
the Swift files and the `site` folder from `ios-swift/TheHolisticEcosystem` to
that project. Make sure the `site` folder is included in the app target.

The app loads this bundled home page:

```text
ios-swift/TheHolisticEcosystem/site/theholisticecosystem.html
```

Archive the app in Xcode when you are ready to upload to App Store Connect.

## Store Notes

Apple and Google may ask for the app to offer more than only a website wrapper.
Good next additions would be:

- Podcast links.
- Blog reader.
- Saved favorite health resources.
- Push notifications for new blog posts.
- Contact or coaching inquiry form.

When the apps are approved, update the website store buttons in
`theholisticecosystem.html`:

- Replace the Apple App Store `href="#"` with the Apple App Store URL.
- Replace the Google Play `href="#"` with the Google Play Store URL.
- Remove the `unavailable` class and `aria-disabled="true"` from each live link.
