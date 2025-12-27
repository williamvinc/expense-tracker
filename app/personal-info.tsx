import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { fonts } from '@/constants/fonts';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { isDarkMode, currentAccentColor } = useTheme();
  const { user, updateUser } = useUser();
  
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [avatar, setAvatar] = useState(user.avatar || '');

  const pickImage = async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to change your profile picture.');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    updateUser({ name, email, phone, address, avatar });
    router.back();
  };

  const bgColor = '#FDF8E8'; // Warm cream background like the design
  const cardBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const labelColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const inputBg = isDarkMode ? '#374151' : '#FAF5E4';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <IconSymbol name="chevron.left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>Personal Info</Text>
          <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }]}>
                <IconSymbol name="person.fill" size={48} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
              </View>
            )}
            {/* Edit badge */}
            <View style={[styles.editBadge, { backgroundColor: currentAccentColor }]}>
              <IconSymbol name="pencil" size={14} color="#111827" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.photoHint, { color: labelColor }]}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Full Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <IconSymbol name="person.fill" size={20} color={labelColor} />
              <TextInput 
                value={name}
                onChangeText={setName}
                style={[styles.input, { color: textColor }]}
                placeholder="Your Name"
                placeholderTextColor={labelColor}
              />
            </View>
          </View>

          {/* Email Address */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Email Address</Text>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <IconSymbol name="envelope.fill" size={20} color={labelColor} />
              <TextInput 
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: textColor }]}
                placeholder="email@example.com"
                placeholderTextColor={labelColor}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Phone Number</Text>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <IconSymbol name="phone.fill" size={20} color={labelColor} />
              <TextInput 
                value={phone}
                onChangeText={setPhone}
                style={[styles.input, { color: textColor }]}
                placeholder="+1(000) 000-0000"
                placeholderTextColor={labelColor}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Physical Address */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: labelColor }]}>Physical Address</Text>
            <View style={[styles.inputContainer, { backgroundColor: inputBg }]}>
              <IconSymbol name="mappin" size={20} color={labelColor} />
              <TextInput 
                value={address}
                onChangeText={setAddress}
                style={[styles.input, { color: textColor }]}
                placeholder="Your Address"
                placeholderTextColor={labelColor}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button - Fixed at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: currentAccentColor }]}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: fonts.display.bold,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    photoSection: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#FDF8E8',
    },
    photoHint: {
        fontSize: 14,
    },
    formSection: {
        gap: 20,
    },
    fieldGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.sans.semibold,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontFamily: fonts.sans.regular,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingBottom: 34,
        paddingTop: 16,
    },
    saveBtn: {
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    saveBtnText: {
        fontFamily: fonts.sans.bold,
        fontSize: 16,
        color: '#111827',
    },
});
