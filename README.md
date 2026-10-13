# Sweet Box Run — Android APK builder

This is a small offline-first Android WebView wrapper around a lightweight perspective-rendered endless runner. Your uploaded face crop is packaged at `app/src/main/assets/player-face.jpg`. All gameplay runs locally and does not require internet access.

## Gameplay
- Three lanes; swipe left/right or use arrows.
- Swipe up / ↑ to jump; swipe down / ↓ to slide.
- Collect sweet boxes; golden boxes are bonus points.
- Avoid barriers, boxes, scooters, potholes, low banners, dogs and street carts.
- A tanker chase appears during the run.
- Three collisions end the run. Best score saves to local storage.

## Get the APK with GitHub Actions
This environment does not have the Android SDK/Gradle installed, and network access to Google's SDK repository is blocked, so it cannot produce or sign the binary APK directly here. The included GitHub Actions workflow builds an installable debug APK for you on GitHub's free hosted runner.

1. Sign in to GitHub and create a new **public** repository named `sweet-box-run` (a private repo can also work within your Actions quota).
2. Upload all files and folders from this project to the repository's root. Keep `.github/workflows/build-apk.yml` included. You can upload the ZIP's contents through GitHub's web interface, or use Git on a computer.
3. Open the repo's **Actions** tab and select **Build Sweet Box Run APK**.
4. Click **Run workflow** and wait for the green checkmark.
5. Open that completed run, scroll to **Artifacts**, and download `Sweet-Box-Run-APK`.
6. Extract the downloaded artifact ZIP. It contains `app-debug.apk`. Send it to your Android phone and tap it to install. Android may ask you to allow installation from your browser or file manager.

## Optional local build
Install JDK 17, Android SDK platform 35, build-tools 35.0.0 and Gradle 8.9, then run `gradle assembleDebug`. APK output: `app/build/outputs/apk/debug/app-debug.apk`.

## Important
This is a debug APK for personal testing, not a Play Store release. The 3D-like perspective effect is drawn with Canvas for performance; character and obstacles use lightweight stylized graphics. The actual uploaded face photo is rendered on the running character.
