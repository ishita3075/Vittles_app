// screens/VendorHours.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-datetimepicker/datetimepicker";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * VendorHours.js
 * Vendor can:
 * - Set weekly schedule
 * - Set opening & closing time
 * - Mark days closed
 */

export default function VendorHours({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Initial schedule
  const [schedule, setSchedule] = useState(
    days.map((d) => ({
      day: d,
      closed: false,
      openTime: new Date(2025, 1, 1, 9, 0),
      closeTime: new Date(2025, 1, 1, 22, 0),
    }))
  );

  const [picker, setPicker] = useState({
    visible: false,
    mode: "open",
    index: null,
  });

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const toggleClosed = (index) => {
    let copy = [...schedule];
    copy[index].closed = !copy[index].closed;
    setSchedule(copy);
  };

  const openPicker = (index, mode) => {
    setPicker({ visible: true, index, mode });
  };

  const onTimeChange = (e, selectedTime) => {
    if (!selectedTime) {
      setPicker({ ...picker, visible: false });
      return;
    }

    let copy = [...schedule];
    if (picker.mode === "open") {
      copy[picker.index].openTime = selectedTime;
    } else {
      copy[picker.index].closeTime = selectedTime;
    }
    setSchedule(copy);
    setPicker({ ...picker, visible: false });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  async function saveVendorHours() {
    // Replace this with your API
    console.log("Saving hours:", schedule);

    navigation.goBack();
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background, opacity: fadeAnim, paddingTop: StatusBar.currentHeight },
      ]}
    >
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Opening Hours</Text>

        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>

        {schedule.map((day, index) => (
          <View key={index} style={[styles.dayCard, { backgroundColor: colors.card }]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, { color: colors.text }]}>{day.day}</Text>

              <TouchableOpacity onPress={() => toggleClosed(index)}>
                <View
                  style={[
                    styles.closedToggle,
                    { backgroundColor: day.closed ? "#EF444430" : "#10B98130" },
                  ]}
                >
                  <Ionicons
                    name={day.closed ? "close-circle" : "checkmark-circle"}
                    size={18}
                    color={day.closed ? "#EF4444" : "#10B981"}
                  />
                  <Text
                    style={[
                      styles.closedToggleText,
                      { color: day.closed ? "#EF4444" : "#10B981" },
                    ]}
                  >
                    {day.closed ? "Closed" : "Open"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {!day.closed && (
              <View style={styles.timeRow}>
                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => openPicker(index, "open")}
                >
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Opens</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>{formatTime(day.openTime)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.timeBox}
                  onPress={() => openPicker(index, "close")}
                >
                  <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Closes</Text>
                  <Text style={[styles.timeValue, { color: colors.text }]}>{formatTime(day.closeTime)}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.saveBtn} onPress={saveVendorHours}>
          <Text style={styles.saveText}>Save Hours</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* TIME PICKER */}
      {picker.visible && (
        <DateTimePicker
          value={
            picker.mode === "open"
              ? schedule[picker.index].openTime
              : schedule[picker.index].closeTime
          }
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onTimeChange}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 52,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 18, fontFamily: 'Outfit_800ExtraBold' },

  dayCard: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dayTitle: { fontSize: 16, fontFamily: 'Outfit_800ExtraBold' },

  closedToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  closedToggleText: { marginLeft: 6, fontFamily: 'Outfit_700Bold', fontSize: 13 },

  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  timeBox: {
    width: "48%",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#E5E7EB20",
  },
  timeLabel: { fontSize: 13, fontFamily: 'Outfit_400Regular' },
  timeValue: { marginTop: 4, fontSize: 16, fontFamily: 'Outfit_700Bold' },

  saveBtn: {
    marginTop: 20,
    backgroundColor: "#8B3358",
    paddingVertical: 16,
    borderRadius: 14,
  },
  saveText: { textAlign: "center", color: "#FFF", fontFamily: 'Outfit_800ExtraBold', fontSize: 16 },
});
