import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Info, 
  Github, 
  Heart, 
  Shield, 
  Globe, 
  Zap,
  Users,
  ExternalLink
} from 'lucide-react-native';

export default function AboutScreen() {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const FeatureCard = ({ 
    icon, 
    title, 
    description 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
  }) => (
    <View style={styles.featureCard}>
      <View style={styles.featureIcon}>
        {icon}
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const LinkItem = ({ 
    icon, 
    title, 
    subtitle, 
    url 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    url: string;
  }) => (
    <TouchableOpacity 
      style={styles.linkItem}
      onPress={() => handleLinkPress(url)}
    >
      <View style={styles.linkIcon}>
        {icon}
      </View>
      <View style={styles.linkContent}>
        <Text style={styles.linkTitle}>{title}</Text>
        <Text style={styles.linkSubtitle}>{subtitle}</Text>
      </View>
      <ExternalLink size={16} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Info size={24} color="#3b82f6" />
            <Text style={styles.headerTitle}>About</Text>
          </View>
          <Text style={styles.headerSubtitle}>Privacy-first translation keyboard</Text>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Globe size={32} color="#3b82f6" />
          </View>
          <Text style={styles.appName}>Polyglot Key</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (Demo)</Text>
          <Text style={styles.appDescription}>
            A privacy-first, real-time translation keyboard that works completely offline. 
            Translate between 55+ languages without sending your data to any servers.
          </Text>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          
          <FeatureCard
            icon={<Shield size={20} color="#10b981" />}
            title="Privacy First"
            description="All translations happen on your device. Zero data leaves your phone."
          />
          
          <FeatureCard
            icon={<Zap size={20} color="#f59e0b" />}
            title="Real-time Translation"
            description="See translations as you type with instant suggestion strips."
          />
          
          <FeatureCard
            icon={<Globe size={20} color="#3b82f6" />}
            title="55+ Languages"
            description="Support for major world languages with offline models."
          />
          
          <FeatureCard
            icon={<Users size={20} color="#ec4899" />}
            title="Open Source"
            description="Built with open-source ML models and free dependencies."
          />
        </View>

        {/* Technology Stack */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology</Text>
          <View style={styles.techGrid}>
            <View style={styles.techItem}>
              <Text style={styles.techName}>OPUS-MT</Text>
              <Text style={styles.techDescription}>Translation Models</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>TensorFlow Lite</Text>
              <Text style={styles.techDescription}>ML Runtime</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>CLD3</Text>
              <Text style={styles.techDescription}>Language Detection</Text>
            </View>
            <View style={styles.techItem}>
              <Text style={styles.techName}>React Native</Text>
              <Text style={styles.techDescription}>Mobile Framework</Text>
            </View>
          </View>
        </View>

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>
          
          <LinkItem
            icon={<Github size={20} color="#1f2937" />}
            title="Source Code"
            subtitle="View on GitHub"
            url="https://github.com/polyglot-key"
          />
          
          <LinkItem
            icon={<Heart size={20} color="#ef4444" />}
            title="Support Development"
            subtitle="Help fund open-source development"
            url="https://github.com/sponsors/polyglot-key"
          />
          
          <LinkItem
            icon={<Shield size={20} color="#059669" />}
            title="Privacy Policy"
            subtitle="How we protect your data"
            url="https://polyglot-key.app/privacy"
          />
        </View>

        {/* License Info */}
        <View style={styles.licenseSection}>
          <Text style={styles.licenseTitle}>Open Source Licenses</Text>
          <Text style={styles.licenseText}>
            This app is built with open-source components under various licenses including MIT, Apache-2.0, and CC-BY-4.0. 
            Translation models are provided by Helsinki-NLP under Creative Commons licensing.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for privacy-conscious users worldwide
          </Text>
          <Text style={styles.footerVersion}>
            © 2024 Polyglot Key • Demo Version
          </Text>
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
  appInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  techName: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 4,
  },
  techDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
    marginBottom: 2,
  },
  linkSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  licenseSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  licenseTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  licenseText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerVersion: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
  },
});