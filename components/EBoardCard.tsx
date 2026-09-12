import React, { useRef, useState } from 'react';
import { Animated, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useTheme from '../utils/useTheme';

interface EBoardMember {
  id: string; name: string; position: string; major: string; classYear: string; image?: any;
  bio?: string; goal: string; whyAlpfa: string; role: string; funFact?: string;
  linkedin?: string; instagram?: string; email?: string;
}

export default function EBoardCard({ member, animationDelay }: { member: EBoardMember; animationDelay: number }) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const [expanded, setExpanded] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, delay: animationDelay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay: animationDelay, useNativeDriver: true }),
    ]).start();
  }, [animationDelay, opacity, translateY]);

  const initials = member.name.split(' ').map((part) => part[0]).slice(0, 2).join('');
  const open = (url?: string) => url && Linking.openURL(url).catch(() => undefined);

  return (
    <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
      <TouchableOpacity
        activeOpacity={0.82}
        style={styles.summary}
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${member.name}'s profile`}
      >
        {member.image ? <Image source={member.image} style={styles.avatar} /> : (
          <View style={styles.placeholder}><Text style={styles.initials}>{initials}</Text></View>
        )}
        <View style={styles.identity}>
          <Text style={styles.name}>{member.name}</Text>
          <Text style={styles.position}>{member.position}</Text>
          <Text style={styles.meta}>{member.major} · {member.classYear}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-forward'} size={18} color="#767B7F" />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          {member.bio && <Detail label="Bio" text={member.bio} styles={styles} />}
          <Detail label="Goal" text={member.goal} styles={styles} />
          <Detail label="Why ALPFA" text={member.whyAlpfa} styles={styles} />
          {member.funFact && <Detail label="Fun fact" text={member.funFact} styles={styles} />}
          {(member.linkedin || member.instagram || member.email) && (
            <View style={styles.socialRow}>
              {member.linkedin && <Social icon="logo-linkedin" label="LinkedIn" onPress={() => open(member.linkedin)} styles={styles} />}
              {member.instagram && <Social icon="logo-instagram" label="Instagram" onPress={() => open(member.instagram)} styles={styles} />}
              {member.email && <Social icon="mail" label="Email" onPress={() => open(`mailto:${member.email}`)} styles={styles} />}
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

function Detail({ label, text, styles }: { label: string; text: string; styles: ReturnType<typeof createStyles> }) {
  return <Text style={styles.detail}><Text style={styles.detailLabel}>{label}: </Text>{text}</Text>;
}

function Social({ icon, label, onPress, styles }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; styles: ReturnType<typeof createStyles> }) {
  return (
    <TouchableOpacity style={styles.social} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.socialIcon}><Ionicons name={icon} size={19} color="#FFFFFF" /></View>
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 15, marginBottom: 12, shadowColor: '#4B392C', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3, overflow: 'hidden' },
  summary: { minHeight: 102, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 13 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#EEE8DE' },
  placeholder: { width: 76, height: 76, borderRadius: 38, backgroundColor: '#EFE7DB', borderWidth: 1, borderColor: '#E0D4C4', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#8D102B', fontSize: 21, fontWeight: '900' },
  identity: { flex: 1, minWidth: 0 },
  name: { color: colors.textPrimary, fontSize: 16, fontWeight: '900' },
  position: { color: '#8D102B', fontSize: 13, fontWeight: '700', marginTop: 3 },
  meta: { color: colors.textSecondary, fontSize: 10, marginTop: 5 },
  details: { marginHorizontal: 12, paddingTop: 14, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#E7CFA5' },
  detail: { color: colors.textPrimary, fontSize: 11, lineHeight: 17, marginBottom: 7 },
  detailLabel: { fontWeight: '900' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E7CFA5' },
  social: { alignItems: 'center', minWidth: 54 },
  socialIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#8D102B', alignItems: 'center', justifyContent: 'center' },
  socialLabel: { color: colors.textPrimary, fontSize: 9, marginTop: 5 },
});
