import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getBrandConfig } from '../../brandConfig';

const config = getBrandConfig();

export default function AuthScreen() {
    const [isSignup, setIsSignup] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const auth = getAuth();

    const handleAuth = async () => {
        if (!email || !password) return;

        setLoading(true);
        setMessage('');
        setIsError(false);
        try {
            if (isSignup) {
                if (password !== confirm) {
                    setMessage("Паролите не съвпадат.");
                    setIsError(true);
                    setLoading(false);
                    return;
                }
                await createUserWithEmailAndPassword(auth, email, password);
                // Auth state listener in App.js will handle navigation
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            console.error(err);
            setIsError(true);
            const code = err.code;
            if (code === 'auth/email-already-in-use') setMessage("Имейлът е зает.");
            else if (code === 'auth/invalid-email') setMessage("Невалиден имейл.");
            else if (code === 'auth/weak-password') setMessage("Слаба парола.");
            else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') setMessage("Грешен имейл или парола.");
            else setMessage(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Iva Music</Text>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, isSignup && styles.tabActive]}
                    onPress={() => setIsSignup(true)}
                >
                    <Text style={[styles.tabText, isSignup && styles.tabTextActive]}>Създай акаунт</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, !isSignup && styles.tabActive]}
                    onPress={() => setIsSignup(false)}
                >
                    <Text style={[styles.tabText, !isSignup && styles.tabTextActive]}>Вход</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="example@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.label}>Password *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="******"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {isSignup && (
                    <>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="******"
                            value={confirm}
                            onChangeText={setConfirm}
                            secureTextEntry
                        />
                    </>
                )}

                {message ? <Text style={[styles.msg, isError && styles.msgError]}>{message}</Text> : null}

                <TouchableOpacity style={styles.submitBtn} onPress={handleAuth} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : (
                        <Text style={styles.submitBtnText}>{isSignup ? "СЪЗДАЙ АКАУНТ" : "ВХОД"}</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: config.colors.primary,
        marginBottom: 30,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 20,
        width: '100%',
        maxWidth: 300,
    },
    tab: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#eee',
    },
    tabActive: {
        borderBottomColor: config.colors.primary,
    },
    tabText: {
        color: config.colors.primary,
        fontWeight: 'bold',
    },
    tabTextActive: {
        color: config.colors.primary,
    },
    form: {
        width: '100%',
        maxWidth: 300,
    },
    label: {
        color: config.colors.primary,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: config.colors.primary,
        padding: 10,
        borderRadius: 4,
        marginBottom: 5,
    },
    submitBtn: {
        backgroundColor: config.colors.primary,
        padding: 15,
        alignItems: 'center',
        borderRadius: 4,
        marginTop: 20,
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    msg: {
        color: config.colors.primary,
        marginTop: 10,
        textAlign: 'center',
    },
    msgError: {
        color: '#c0392b',
        fontWeight: 'bold',
    }
});
