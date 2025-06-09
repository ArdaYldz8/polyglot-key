#!/bin/bash
# Step 4: Local verification script
# Run this on your Mac to verify iOS build works before CI

set -e  # Exit on any error

echo "🔍 Step 4: Local iOS Verification"
echo "================================="

echo "📁 Cleaning existing iOS folder..."
rm -rf ios

echo "🍎 Running expo prebuild..."
npx expo prebuild --clean --platform ios

echo "📦 Installing CocoaPods..."
cd ios
pod install
cd ..

echo "🏗️ Testing Xcode build..."
xcodebuild -workspace ios/PolyglotKey.xcworkspace \
           -scheme PolyglotKey \
           -configuration Debug \
           -sdk iphonesimulator \
           build CODE_SIGNING_ALLOWED=NO

echo ""
echo "✅ SUCCESS: Local iOS build completed!"
echo "🚀 CI should now work with same configuration"
echo ""
echo "📋 Next steps:"
echo "   1. Commit any changes to app.json if needed"
echo "   2. Run 'iOS Build (Battle-Tested)' workflow"
echo "   3. Or use Plan B: git add ios/ && git commit" 