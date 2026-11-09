document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db = MemoraAdmin.db;
    const page = document.getElementById("adminPage");

    page.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Payment</div>
          <h1>Payment Verification</h1>
          <p>Periksa konfirmasi pembayaran dari customer.</p>
        </div>
      </div>

      <div class="stats" id="paymentStats"></div>

      <div class="toolbar">
        <select id="paymentFilter">
          <option value="">Semua Status</option>
          <option value="waiting_verification">Waiting</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <section class="panel">
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Order</th>
                <th>Nominal</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody id="paymentRows"></tbody>
          </table>
        </div>
      </section>
    `;

    const { data, error } =
      await db
        .from("payment_confirmations")
        .select("*")
        .order("submitted_at", {
          ascending:false
        });

    if (error) throw error;

    const payments =
      data || [];

    function stats() {

      const waiting =
        payments.filter(
          x => x.status === "waiting_verification"
        ).length;

      const verified =
        payments.filter(
          x => x.status === "verified"
        ).length;

      const rejected =
        payments.filter(
          x => x.status === "rejected"
        ).length;

      document.getElementById("paymentStats").innerHTML = `
        <div class="stat">
          <span>Waiting</span>
          <strong>${waiting}</strong>
        </div>

        <div class="stat">
          <span>Verified</span>
          <strong>${verified}</strong>
        </div>

        <div class="stat">
          <span>Rejected</span>
          <strong>${rejected}</strong>
        </div>

        <div class="stat">
          <span>Total Confirmation</span>
          <strong>${payments.length}</strong>
        </div>
      `;
    }

    function render() {

      const filter =
        document.getElementById("paymentFilter").value;

      const rows =
        payments.filter(
          x => !filter || x.status === filter
        );

      document.getElementById("paymentRows").innerHTML =
        rows.map(item => `
          <tr>

            <td>
              ${MemoraAdmin.date(item.submitted_at)}
            </td>

            <td>
              ${MemoraAdmin.escapeHtml(item.order_id)}
            </td>

            <td>
              <strong>
                ${MemoraAdmin.money(item.amount)}
              </strong>
            </td>

            <td>
              ${MemoraAdmin.escapeHtml(item.payment_method || "-")}
            </td>

            <td>
              <span class="badge">
                ${MemoraAdmin.statusLabel(item.status)}
              </span>
            </td>

            <td>
              ${
                item.status === "waiting_verification"
                ? `
                  <div style="display:flex;gap:7px">
                    <button
                      class="btn btn-primary"
                      data-verify="${item.id}"
                    >
                      Verify
                    </button>

                    <button
                      class="btn btn-danger"
                      data-reject="${item.id}"
                    >
                      Reject
                    </button>
                  </div>
                `
                : "-"
              }
            </td>

          </tr>
        `).join("") ||
        `<tr><td colspan="6" class="empty">Tidak ada payment confirmation.</td></tr>`;

      document
        .querySelectorAll("[data-verify]")
        .forEach(button => {

          button.addEventListener("click", async () => {

            const id =
              button.dataset.verify;

            const { error } =
              await db.rpc(
                "verify_memora_payment_confirmation",
                {
                  p_confirmation_id:id
                }
              );

            if (error) {
              alert(error.message);
              return;
            }

            const item =
              payments.find(x => x.id === id);

            if (item) item.status = "verified";

            stats();
            render();

            alert("Status pembayaran berhasil diperbarui.");

          });

        });

      document
        .querySelectorAll("[data-reject]")
        .forEach(button => {

          button.addEventListener("click", async () => {

            const id =
              button.dataset.reject;

            const { error } =
              await db
                .from("payment_confirmations")
                .update({
                  status:"rejected",
                  verified_at:new Date().toISOString()
                })
                .eq("id", id);

            if (error) {
              alert(error.message);
              return;
            }

            const item =
              payments.find(x => x.id === id);

            if (item) item.status = "rejected";

            stats();
            render();

          });

        });

    }

    document
      .getElementById("paymentFilter")
      .addEventListener("change", render);

    stats();
    render();

  });

});