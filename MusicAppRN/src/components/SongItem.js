import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { getDatabase, ref, remove, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { getBrandConfig } from '../../brandConfig';

const config = getBrandConfig();

export default function SongItem({ song, onPlay }) {
    const [showMenu, setShowMenu] = useState(false);
    const [editMode, setEditMode] = useState(null); // 'name' or 'url'
    const [editValue, setEditValue] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const auth = getAuth();
    const database = getDatabase();

    const handleDelete = () => {
        Alert.alert(
            "Изтрий",
            "Сигурни ли сте, че искате да изтриете тази песен?",
            [
                { text: "Отказ", style: "cancel" },
                {
                    text: "Да",
                    onPress: async () => {
                        if (auth.currentUser) {
                            const songRef = ref(database, `users/${auth.currentUser.uid}/songs/${song.key}`);
                            await remove(songRef);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleEdit = (mode) => {
        setEditMode(mode);
        setEditValue(mode === 'name' ? song.name : song.url);
        setShowMenu(false);
        setModalVisible(true);
    };

    const saveEdit = async () => {
        if (!editValue.trim()) return;

        try {
            if (auth.currentUser) {
                const songRef = ref(database, `users/${auth.currentUser.uid}/songs/${song.key}`);
                const updates = {};
                updates[editMode] = editValue.trim();
                await update(songRef, updates);
            }
            setModalVisible(false);
        } catch (error) {
            Alert.alert("Грешка", error.message);
        }
    };

    return (
        <View style={styles.item}>
            <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(song.url)}>
                <Text style={styles.playBtnText}>▶ Пусни</Text>
            </TouchableOpacity>

            <Text style={styles.name} numberOfLines={1}>{song.name}</Text>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => setShowMenu(!showMenu)}>
                    <Ionicons name="settings-sharp" size={24} color={config.colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={24} color={config.colors.primary} />
                </TouchableOpacity>
            </View>

            {showMenu && (
                <View style={styles.menu}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleEdit('name')}>
                        <Text style={styles.menuText}>Промени име</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={() => handleEdit('url')}>
                        <Text style={styles.menuText}>Промени URL</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            {editMode === 'name' ? "Промени име" : "Промени URL"}
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={editValue}
                            onChangeText={setEditValue}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
                                <Text style={styles.btnText}>Oтказ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalBtnSave} onPress={saveEdit}>
                                <Text style={styles.btnText}>Запиши</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: config.colors.primary,
        borderRadius: 4,
        marginBottom: 10,
        backgroundColor: '#fff',
        zIndex: 1,
    },
    playBtn: {
        backgroundColor: config.colors.primary,
        padding: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginRight: 10,
    },
    playBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    name: {
        flex: 1,
        color: config.colors.primary,
        fontWeight: '500',
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBtn: {
        padding: 5,
        marginLeft: 5,
    },
    menu: {
        position: 'absolute',
        right: 40,
        top: 35,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: config.colors.primary,
        borderRadius: 4,
        zIndex: 10,
        elevation: 5,
        width: 130,
    },
    menuItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuText: {
        color: config.colors.primary,
        fontSize: 13,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCard: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: config.colors.primary,
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: config.colors.primary,
        padding: 10,
        borderRadius: 4,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalBtnCancel: {
        padding: 10,
        marginRight: 10,
    },
    modalBtnSave: {
        backgroundColor: config.colors.primary,
        padding: 10,
        borderRadius: 4,
    },
    btnText: {
        color: config.colors.primary,
        fontWeight: 'bold',
    },
    // Fix text color for Save button
});

// Overriding style for save button text locally
styles.modalBtnSave = {
    ...styles.modalBtnSave,
    alignItems: 'center'
}
// Actually let's fix the color in the object
styles.btnText = {
    ...styles.btnText,
    // default,
}

// Wait, styles object is frozen after create? No.
// But cleanly:
// I'll fix styles in the StyleSheet.create above.
