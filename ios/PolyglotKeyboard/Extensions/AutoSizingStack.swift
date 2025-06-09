//
//  AutoSizingStack.swift
//  PolyglotKeyboard
//
//  Created for iOS 16+ compatibility with SwiftUI geometry changes
//

#if swift(>=5.9)
import SwiftUI

extension View {
  @ViewBuilder
  func sizeAware(action: @escaping (CGSize) -> Void) -> some View {
    if #available(iOS 17.0, *) {
      self.onGeometryChange(for: CGSize.self) { proxy in
        action(proxy.size)
      }
    } else {
      // Fallback for iOS 16
      self.background(GeometryReader { geometry in
        Color.clear
          .preference(key: SizePreferenceKey.self, value: geometry.size)
      })
      .onPreferenceChange(SizePreferenceKey.self, perform: action)
    }
  }
}

#else
// Fallback for older tool-chains (Xcode < 15)
import SwiftUI

extension View {
  @ViewBuilder
  func sizeAware(action: @escaping (CGSize) -> Void) -> some View {
    self.background(GeometryReader { geometry in
      Color.clear
        .preference(key: SizePreferenceKey.self, value: geometry.size)
    })
    .onPreferenceChange(SizePreferenceKey.self, perform: action)
  }
}
#endif

// Shared preference key
private struct SizePreferenceKey: PreferenceKey {
  static var defaultValue: CGSize = .zero
  static func reduce(value: inout CGSize, nextValue: () -> CGSize) {
    // Keep the latest value
  }
} 