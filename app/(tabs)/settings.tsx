import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings as SettingsIcon,
  Download,
  Shield,
  Palette,
  Globe,
  ChevronRight,
  HardDrive,
  Wifi,
  Moon,
  Sun,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const [offlineMode, setOfflineMode] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    hasSwitch,
    switchValue,
    onSwitchChange,
    hasChevron = true,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    hasChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={hasSwitch}
    >
      <View style={styles.settingIcon}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#d1d5db', true: '#bfdbfe' }}
          thumbColor={switchValue ? '#3b82f6' : '#f3f4f6'}
        />
      ) : (
        hasChevron && <ChevronRight size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <SettingsIcon size={24} color="#3b82f6" />
            <Text style={styles.headerTitle}>Settings</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            Customize your translation experience
          </Text>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>

          <SettingItem
            icon={<Shield size={20} color="#10b981" />}
            title="Offline Mode"
            subtitle="Process all translations locally for maximum privacy"
            hasSwitch
            switchValue={offlineMode}
            onSwitchChange={setOfflineMode}
          />

          <SettingItem
            icon={<HardDrive size={20} color="#6b7280" />}
            title="Downloaded Models"
            subtitle="Manage your offline translation models"
            onPress={() => {}}
          />

          <SettingItem
            icon={<Wifi size={20} color="#f59e0b" />}
            title="Cloud Assist"
            subtitle="Use cloud APIs for improved accuracy (requires API key)"
            onPress={() => {}}
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>

          <SettingItem
            icon={
              darkMode ? (
                <Moon size={20} color="#6366f1" />
              ) : (
                <Sun size={20} color="#f59e0b" />
              )
            }
            title="Dark Mode"
            subtitle="Switch to dark theme"
            hasSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />

          <SettingItem
            icon={<Palette size={20} color="#ec4899" />}
            title="Keyboard Themes"
            subtitle="Customize keyboard appearance"
            onPress={() => {}}
          />
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>

          <SettingItem
            icon={<Globe size={20} color="#3b82f6" />}
            title="Auto-Detect Language"
            subtitle="Automatically detect input language"
            hasSwitch
            switchValue={autoDetect}
            onSwitchChange={setAutoDetect}
          />

          <SettingItem
            icon={<Download size={20} color="#059669" />}
            title="Language Packs"
            subtitle="Download additional language models"
            onPress={() => {}}
          />
        </View>

        {/* Keyboard Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keyboard</Text>

          <SettingItem
            icon={<SettingsIcon size={20} color="#6b7280" />}
            title="Haptic Feedback"
            subtitle="Vibrate on key press"
            hasSwitch
            switchValue={hapticFeedback}
            onSwitchChange={setHapticFeedback}
          />
        </View>

        {/* Model Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Management</Text>

          <View style={styles.modelList}>
            <View style={styles.modelItem}>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>English ↔ Spanish</Text>
                <Text style={styles.modelSize}>12.3 MB • Downloaded</Text>
              </View>
              <View style={[styles.modelStatus, styles.modelDownloaded]}>
                <Text style={styles.modelStatusText}>Ready</Text>
              </View>
            </View>

            <View style={styles.modelItem}>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>English ↔ French</Text>
                <Text style={styles.modelSize}>11.8 MB • Downloaded</Text>
              </View>
              <View style={[styles.modelStatus, styles.modelDownloaded]}>
                <Text style={styles.modelStatusText}>Ready</Text>
              </View>
            </View>

            <View style={styles.modelItem}>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>English ↔ German</Text>
                <Text style={styles.modelSize}>13.1 MB • Not Downloaded</Text>
              </View>
              <TouchableOpacity
                style={[styles.modelStatus, styles.modelNotDownloaded]}
              >
                <Download size={14} color="#3b82f6" />
                <Text style={styles.modelDownloadText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Storage Info */}
        <View style={styles.storageInfo}>
          <Text style={styles.storageTitle}>Storage Usage</Text>
          <View style={styles.storageBar}>
            <View style={[styles.storageUsed, { width: '35%' }]} />
          </View>
          <Text style={styles.storageText}>24.1 MB of 128 MB used</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1f2937',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 16,
  },
  modelList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1f2937',
    marginBottom: 2,
  },
  modelSize: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  modelStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  modelDownloaded: {
    backgroundColor: '#dcfce7',
  },
  modelNotDownloaded: {
    backgroundColor: '#eff6ff',
  },
  modelStatusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#059669',
  },
  modelDownloadText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#3b82f6',
  },
  storageInfo: {
    marginHorizontal: 20,
    marginBottom: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  storageTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  storageBar: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    marginBottom: 8,
  },
  storageUsed: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  storageText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
});
