import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, SafeAreaView, ImageBackground } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import SongItem from '../components/SongItem';
import YouTubePlayer from '../components/YouTubePlayer';

export default function HomeScreen() {
    const [url, setUrl] = useState('');
    const [name, setName] = useState('');
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingUrl, setPlayingUrl] = useState(null);

    const auth = getAuth();
    const database = getDatabase();
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;

        const songsRef = ref(database, `users/${user.uid}/songs`);
        const unsubscribe = onValue(songsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const songList = Object.entries(data).map(([key, value]) => ({
                    key,
                    ...value
                }));
                // In web app, we didn't explicitly sort, but Firebase returns usually interaction order or key order.
                // We'll just reverse to show newest first if we wanted, or keep as is.
                setSongs(songList);
            } else {
                setSongs([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddSong = async () => {
        if (!url.trim()) {
            Alert.alert("Грешка", "Моля въведете URL.");
            return;
        }

        try {
            const songsRef = ref(database, `users/${user.uid}/songs`);
            // Helper to get display name from previous logic
            let finalName = name.trim();
            if (!finalName) {
                // Simple logic to set default if empty (Ported from getDisplayName logic slightly simplified)
                finalName = "Untitled";
                const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/);
                if (match) finalName = "YouTube video";
            }

            await push(songsRef, {
                url: url.trim(),
                name: finalName
            });

            setUrl('');
            setName('');
        } catch (error) {
            Alert.alert("Грешка", error.message);
        }
    };

    const handleSignOut = () => {
        signOut(auth).catch(err => console.error(err));
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Image mock - RN doesn't support local file URL same way easily without import, 
                we'll just use a solid color or gradient for now to keep it simple, or require a local asset if available. 
                For this port, clean UI is better than broken image. */}

            <View style={styles.header}>
                <View>
                    <Text style={styles.userLabel}>Потребител:</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                    <Text style={styles.logoutText}>Изход</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Добави песен в списъка</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://youtube.com/..."
                    value={url}
                    onChangeText={setUrl}
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Име на песента:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="My Song"
                    value={name}
                    onChangeText={setName}
                />

                <TouchableOpacity style={styles.addBtn} onPress={handleAddSong}>
                    <Text style={styles.addBtnText}>ЗАПИШИ</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#b52b85" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={songs}
                    renderItem={({ item }) => (
                        <SongItem
                            song={item}
                            onPlay={(videoUrl) => setPlayingUrl(videoUrl)}
                        />
                    )}
                    keyExtractor={item => item.key}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>Няма добавени песни.</Text>}
                />
            )}

            <YouTubePlayer
                visible={!!playingUrl}
                url={playingUrl}
                onClose={() => setPlayingUrl(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa', // Light gray background instead of flowers.jpg
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 5,
        marginTop: 40, // Added spacing from top
    },
    userLabel: {
        fontSize: 12,
        color: '#b52b85',
    },
    userEmail: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#b52b85',
    },
    logoutBtn: {
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
    },
    logoutText: {
        fontSize: 12,
        color: '#333',
    },
    inputContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#eee',
    },
    label: {
        color: '#b52b85',
        fontWeight: '900',
        marginBottom: 5,
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: '#b52b85',
        padding: 10,
        borderRadius: 4,
        marginBottom: 10,
    },
    addBtn: {
        backgroundColor: '#b52b85',
        padding: 12,
        alignItems: 'center',
        borderRadius: 4,
        marginTop: 5,
    },
    addBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    list: {
        paddingBottom: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        fontSize: 16,
    }
});
