import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import InstallSheet from "./components/InstallSheet";
import LoginPage from "./features/auth/LoginPage";
import HomePage from "./features/home/HomePage";
import MyCoursesPage from "./features/home/MyCoursesPage";
import AllCoursesPage from "./features/courses/AllCoursesPage";
import CourseDetailPage from "./features/courses/CourseDetailPage";
import LessonPlayerPage from "./features/lesson/LessonPlayerPage";
import { recordSessionStart } from "./lib/engagement";

export default function App() {
  useEffect(() => {
    recordSessionStart();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-courses"
                element={
                  <ProtectedRoute>
                    <MyCoursesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/courses" element={<AllCoursesPage />} />
              <Route path="/courses/:slug" element={<CourseDetailPage />} />
              <Route
                path="/courses/:courseSlug/lessons/:lessonSlug"
                element={<LessonPlayerPage />}
              />
            </Routes>
            <InstallSheet />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
