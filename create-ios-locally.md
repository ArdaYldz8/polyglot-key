# Plan B: iOS Klasörünü Lokal Oluştur ve Commit Et

Eğer CI'da expo prebuild çalışmazsa, bu adımları takip edin:

## Mac'inizde (Tek Seferlik)

```bash
# 1. iOS klasörünü temiz oluştur
npx expo prebuild --clean --platform ios

# 2. Podfile'ı kontrol et
ls -la ios/Podfile

# 3. iOS klasörünü repoya ekle
git add ios/
git commit -m "feat: Add iOS native project for CI compatibility"
git push origin master
```

## CI Workflow'unu Basitleştir

Sonra workflows'ta sadece bunu bırakın:
```yaml
- name: Install iOS dependencies
  run: |
    cd ios
    pod install --repo-update
```

**Avantajlar:**
- ✅ Hızlı build (prebuild skip)
- ✅ %100 güvenilir
- ✅ Lokalinizle aynı setup

**Dezavantajlar:**
- ❌ Repo boyutu artar (~20-50MB)
- ❌ Native dependencies değiştiğinde manuel update

Bu çözüm çok yaygın ve production-ready. Birçok React Native projesi böyle çalışır. 