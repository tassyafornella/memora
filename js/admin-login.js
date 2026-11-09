document.addEventListener("DOMContentLoaded", () => {

  const db = window.memoraSupabase;

  const form =
    document.getElementById("loginForm");

  const message =
    document.getElementById("loginMessage");

  form.addEventListener("submit", async event => {

    event.preventDefault();

    message.hidden = true;

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;

    try {

      const { data, error } =
        await db.auth.signInWithPassword({
          email,
          password
        });

      if (error) throw error;

      const user =
        data.user;

      const { data:profile, error:profileError } =
        await db
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) throw profileError;

      if (
        !profile ||
        !["owner","admin"].includes(
          String(profile.role || "").toLowerCase()
        )
      ) {
        await db.auth.signOut();

        throw new Error(
          "Akun ini tidak memiliki akses Administrator."
        );
      }

      window.location.replace(
        "/studio/dashboard/"
      );

    }
    catch (error) {

      message.textContent =
        error.message || "Login gagal.";

      message.className =
        "message error";

      message.hidden =
        false;

    }

  });

});