import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactions } from '@/context/TransactionContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useUser } from '@/context/UserContext';
import { useWallet } from '@/context/WalletContext';
import { useTheme } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WALLET_COLORS, WALLET_ICONS, SUGGESTED_TYPES } from '@/constants/data';
import { Wallet } from '@/constants/types';

export default function WalletScreen() {
  const router = useRouter();
  const { getTransactionsByWallet } = useTransactions();
  const { formatMoney } = useCurrency();
  const { user } = useUser();
  const { isDarkMode, currentAccentColor } = useTheme();
  const { wallets, selectedWallet, selectWallet, addWallet, updateWallet, deleteWallet } = useWallet();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // New Wallet State
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState('Primary');
  const [newWalletColor, setNewWalletColor] = useState(WALLET_COLORS[0].color);
  const [newWalletThemeClass, setNewWalletThemeClass] = useState(WALLET_COLORS[0].class);
  const [newWalletIcon, setNewWalletIcon] = useState('account_balance_wallet');

  // Edit Wallet State
  const [editWalletName, setEditWalletName] = useState('');
  const [editWalletType, setEditWalletType] = useState('Primary');
  const [editWalletColor, setEditWalletColor] = useState('');
  const [editWalletThemeClass, setEditWalletThemeClass] = useState('');
  const [editWalletIcon, setEditWalletIcon] = useState('account_balance_wallet');

  const getWalletBalance = (walletId: string) => {
    const txs = getTransactionsByWallet(walletId);
    return txs.reduce((acc, curr) => {
        const val = Number(curr.amount);
        return curr.type === 'income' ? acc + val : acc - val;
    }, 0);
  };

  const getIconForType = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('sav')) return 'savings';
    if (t.includes('work') || t.includes('business')) return 'domain';
    if (t.includes('travel') || t.includes('trip')) return 'flight';
    if (t.includes('invest') || t.includes('crypto')) return 'trending_up';
    return 'account_balance_wallet';
  };

  const canAddWallet = wallets.length < 4;

  const handleCreateWallet = () => {
    if (!newWalletName.trim()) return;
    if (!canAddWallet) {
        Alert.alert("Available Limit", "Maximum wallet limit reached (4).");
        return;
    }
    
    const newWallet: Wallet = {
        id: Date.now().toString(),
        name: newWalletName,
        type: newWalletType || 'Custom',
        currency: 'USD',
        themeColor: newWalletThemeClass, // Keeping class name for compatibility or mapping
        color: newWalletColor, // Added specific color for mobile
        icon: newWalletIcon,
        cardNumber: Math.floor(1000 + Math.random() * 9000).toString()
    };
    
    addWallet(newWallet);
    setShowAddModal(false);
    setNewWalletName('');
  };

  const handleOpenEdit = () => {
      setEditWalletName(selectedWallet.name);
      setEditWalletType(selectedWallet.type);
      setEditWalletColor(selectedWallet.color || '#111827');
      setEditWalletThemeClass(selectedWallet.themeColor || 'bg-gray-900');
      setEditWalletIcon(selectedWallet.icon || 'account_balance_wallet');
      setShowEditModal(true);
  };

  const handleUpdateWallet = () => {
      if (!editWalletName.trim()) return;
      updateWallet(selectedWallet.id, {
          name: editWalletName,
          type: editWalletType || 'Custom',
          themeColor: editWalletThemeClass,
          color: editWalletColor,
          icon: editWalletIcon
      });
      setShowEditModal(false);
  };

  const handleDeleteWallet = () => {
      Alert.alert(
          "Delete Wallet",
          `Are you sure you want to delete ${selectedWallet.name}?`,
          [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => deleteWallet(selectedWallet.id) }
          ]
      );
  };

  const textColor = isDarkMode ? '#FFFFFF' : '#111827';
  const bgColor = isDarkMode ? '#000000' : '#FFFFFF';
  const cardBg = isDarkMode ? '#1F2937' : '#F3F4F6';

  // Helper to map theme class to hex if color prop is missing (backward compat)
  const getHexFromClass = (cls?: string) => {
      const found = WALLET_COLORS.find(c => c.class === cls);
      return found ? found.color : '#111827';
  };

  const selectedWalletColor = selectedWallet.color || getHexFromClass(selectedWallet.themeColor);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]}>My Wallet</Text>
            </View>

            {/* Selected Wallet Card */}
            <View style={[styles.walletCard, { backgroundColor: selectedWalletColor }]}>
                 <View style={styles.cardHeader}>
                     <View>
                         <Text style={styles.cardLabel}>Total Balance</Text>
                         <Text style={styles.cardBalance}>{formatMoney(getWalletBalance(selectedWallet.id))}</Text>
                     </View>
                     <View style={styles.cardIcon}>
                         <IconSymbol name={selectedWallet.icon as any} size={24} color="#FFF" />
                     </View>
                 </View>
                 <View style={styles.cardFooter}>
                     <View>
                         <Text style={styles.cardLabel}>Wallet ID</Text>
                         <Text style={styles.cardNumber}>W-{selectedWallet.cardNumber || '8829'}</Text>
                     </View>
                     <View>
                         <Text style={styles.cardLabel}>Holder</Text>
                         <Text style={styles.cardHolder}>{user.name}</Text>
                     </View>
                 </View>
            </View>

            {/* Actions */}
            <View style={styles.actionGrid}>
                 <TouchableOpacity style={[styles.actionBtn, { backgroundColor: cardBg }]}>
                     <IconSymbol name="plus.circle.fill" size={24} color={textColor} />
                     <Text style={[styles.actionText, { color: textColor }]}>Top Up</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={[styles.actionBtn, { backgroundColor: cardBg }]}>
                     <IconSymbol name="arrow.up" size={24} color={textColor} />
                     <Text style={[styles.actionText, { color: textColor }]}>Send</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: cardBg }]}
                    onPress={handleOpenEdit}
                 >
                     <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={textColor} /> 
                     {/* Using 'code' SF equivalent */}
                     <Text style={[styles.actionText, { color: textColor }]}>Edit</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: cardBg }]}
                    onPress={handleDeleteWallet}
                    disabled={wallets.length <= 1}
                 >
                     <IconSymbol name="delete.left.fill" size={24} color={wallets.length <= 1 ? '#9CA3AF' : '#EF4444'} />
                     <Text style={[styles.actionText, { color: wallets.length <= 1 ? '#9CA3AF' : '#EF4444' }]}>Delete</Text>
                 </TouchableOpacity>
            </View>

             {/* Other Wallets */}
             <Text style={[styles.sectionTitle, { color: textColor }]}>Other Wallets</Text>
             <View style={styles.walletList}>
                 {wallets.filter(w => w.id !== selectedWallet.id).map(w => (
                     <TouchableOpacity 
                        key={w.id}
                        style={[styles.otherWalletItem, { backgroundColor: cardBg }]}
                        onPress={() => selectWallet(w.id)}
                     >
                         <View style={styles.otherWalletLeft}>
                             <View style={[styles.smallIcon, { backgroundColor: w.color || getHexFromClass(w.themeColor) }]}>
                                 <IconSymbol name={w.icon as any} size={20} color="#FFF" />
                             </View>
                             <View>
                                 <Text style={[styles.otherWalletName, { color: textColor }]}>{w.name}</Text>
                                 <Text style={styles.otherWalletType}>{w.type}</Text>
                             </View>
                         </View>
                         <Text style={[styles.otherWalletBalance, { color: textColor }]}>
                             {formatMoney(getWalletBalance(w.id))}
                         </Text>
                     </TouchableOpacity>
                 ))}

                 {canAddWallet ? (
                     <TouchableOpacity 
                        style={styles.addWalletBtn}
                        onPress={() => setShowAddModal(true)}
                     >
                         <IconSymbol name="plus.circle.fill" size={24} color="#9CA3AF" />
                         <Text style={styles.addWalletText}>Add New Wallet</Text>
                     </TouchableOpacity>
                 ) : (
                     <Text style={styles.limitText}>Wallet Limit Reached</Text>
                 )}
             </View>
        </ScrollView>

        {/* Add Wallet Modal */}
        <Modal visible={showAddModal} animationType="slide" transparent>
             <View style={styles.modalOverlay}>
                 <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
                     <View style={styles.modalHeader}>
                         <Text style={[styles.modalTitle, { color: textColor }]}>New Wallet</Text>
                         <TouchableOpacity onPress={() => setShowAddModal(false)}>
                             <IconSymbol name="xmark" size={24} color={textColor} />
                         </TouchableOpacity>
                     </View>
                     
                     <TextInput 
                        placeholder="Wallet Name"
                        placeholderTextColor="#9CA3AF"
                        value={newWalletName}
                        onChangeText={setNewWalletName}
                        style={[styles.input, { backgroundColor: cardBg, color: textColor }]}
                     />
                     
                     <Text style={[styles.label, { color: textColor }]}>Type</Text>
                     <View style={styles.chips}>
                         {SUGGESTED_TYPES.map(t => (
                             <TouchableOpacity 
                                key={t} 
                                style={[
                                    styles.chip, 
                                    newWalletType === t ? { backgroundColor: currentAccentColor } : { backgroundColor: cardBg }
                                ]}
                                onPress={() => {
                                    setNewWalletType(t);
                                    setNewWalletIcon(getIconForType(t));
                                }}
                             >
                                 <Text style={{ color: newWalletType === t ? '#000' : textColor, fontSize: 12, fontWeight: 'bold' }}>{t}</Text>
                             </TouchableOpacity>
                         ))}
                     </View>

                     <Text style={[styles.label, { color: textColor }]}>Color</Text>
                     <View style={styles.colorGrid}>
                         {WALLET_COLORS.map(c => (
                             <TouchableOpacity 
                                key={c.id}
                                style={[styles.colorOption, { backgroundColor: c.color }, newWalletColor === c.color && styles.selectedColor]}
                                onPress={() => {
                                    setNewWalletColor(c.color);
                                    setNewWalletThemeClass(c.class);
                                }}
                             />
                         ))}
                     </View>

                     <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: currentAccentColor }]}
                        onPress={handleCreateWallet}
                     >
                         <Text style={styles.saveBtnText}>Create Wallet</Text>
                     </TouchableOpacity>
                 </View>
             </View>
        </Modal>

        {/* Edit Wallet Modal */}
        <Modal visible={showEditModal} animationType="slide" transparent>
             <View style={styles.modalOverlay}>
                 <View style={[styles.modalContent, { backgroundColor: bgColor }]}>
                     <View style={styles.modalHeader}>
                         <Text style={[styles.modalTitle, { color: textColor }]}>Edit Wallet</Text>
                         <TouchableOpacity onPress={() => setShowEditModal(false)}>
                             <IconSymbol name="xmark" size={24} color={textColor} />
                         </TouchableOpacity>
                     </View>
                     
                     <TextInput 
                        placeholder="Wallet Name"
                        placeholderTextColor="#9CA3AF"
                        value={editWalletName}
                        onChangeText={setEditWalletName}
                        style={[styles.input, { backgroundColor: cardBg, color: textColor }]}
                     />
                     
                     <Text style={[styles.label, { color: textColor }]}>Color</Text>
                     <View style={styles.colorGrid}>
                         {WALLET_COLORS.map(c => (
                             <TouchableOpacity 
                                key={c.id}
                                style={[styles.colorOption, { backgroundColor: c.color }, editWalletColor === c.color && styles.selectedColor]}
                                onPress={() => {
                                    setEditWalletColor(c.color);
                                    setEditWalletThemeClass(c.class);
                                }}
                             />
                         ))}
                     </View>

                     <TouchableOpacity 
                        style={[styles.saveBtn, { backgroundColor: currentAccentColor }]}
                        onPress={handleUpdateWallet}
                     >
                         <Text style={styles.saveBtnText}>Save Changes</Text>
                     </TouchableOpacity>
                 </View>
             </View>
        </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    walletCard: {
        borderRadius: 24,
        padding: 24,
        height: 200,
        justifyContent: 'space-between',
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardBalance: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
    },
    cardIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    cardNumber: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: 'monospace',
        letterSpacing: 2,
    },
    cardHolder: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'right',
    },
    actionGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    actionBtn: {
        width: '23%',
        aspectRatio: 1,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    walletList: {
        gap: 16,
    },
    otherWalletItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    otherWalletLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    smallIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    otherWalletName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    otherWalletType: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    otherWalletBalance: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addWalletBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E5E7EB',
        borderRadius: 20,
        gap: 8,
    },
    addWalletText: {
        color: '#9CA3AF',
        fontWeight: '600',
    },
    limitText: {
        textAlign: 'center',
        color: '#EF4444',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        paddingBottom: 48,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    input: {
        padding: 16,
        borderRadius: 16,
        fontSize: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
    },
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 24,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    colorOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    selectedColor: {
        borderWidth: 4,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    saveBtn: {
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
});
