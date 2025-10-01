import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/event" />; // 👈 يفتح الأحداث أول شي
}
