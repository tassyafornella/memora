document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db = MemoraAdmin.db;
    const page = document.getElementById("adminPage");

    page.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Customer Data</div>
          <h1>Customers</h1>
          <p>Daftar customer yang terhubung ke MEMORA.</p>
        </div>
      </div>

      <div class="toolbar">
        <input
          id="customerSearch"
          placeholder="Cari customer..."
        >
      </div>

      <section class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody id="customerRows"></tbody>
          </table>
        </div>
      </section>
    `;

    const { data, error } =
      await db
        .from("customers")
        .select("*")
        .order("created_at", {
          ascending:false
        });

    if (error) throw error;

    const customers =
      data || [];

    function render() {

      const q =
        document
          .getElementById("customerSearch")
          .value
          .toLowerCase();

      const rows =
        customers.filter(item => {

          const text = [
            item.full_name,
            item.name,
            item.email,
            item.whatsapp,
            item.phone
          ].join(" ").toLowerCase();

          return text.includes(q);
        });

      document.getElementById("customerRows").innerHTML =
        rows.map(item => `
          <tr>
            <td>
              <strong>
                ${MemoraAdmin.escapeHtml(
                  item.full_name ||
                  item.name ||
                  "-"
                )}
              </strong>
            </td>

            <td>
              ${MemoraAdmin.escapeHtml(item.email || "-")}
            </td>

            <td>
              ${MemoraAdmin.escapeHtml(
                item.whatsapp ||
                item.phone ||
                "-"
              )}
            </td>

            <td>
              ${MemoraAdmin.date(item.created_at)}
            </td>
          </tr>
        `).join("") ||
        `<tr><td colspan="4" class="empty">Tidak ada customer.</td></tr>`;

    }

    document
      .getElementById("customerSearch")
      .addEventListener("input", render);

    render();

  });

});