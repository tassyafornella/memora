document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db = MemoraAdmin.db;
    const page = document.getElementById("adminPage");

    page.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Finance</div>
          <h1>Finance</h1>
          <p>Ringkasan nilai order dan pembayaran yang diterima.</p>
        </div>
      </div>

      <div class="stats" id="financeStats"></div>

      <section class="panel">
        <div class="panel-head">
          <h2>Payment Records</h2>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Order ID</th>
                <th>Type</th>
                <th>Method</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody id="financeRows"></tbody>
          </table>
        </div>
      </section>
    `;

    const [
      ordersResult,
      paymentsResult
    ] = await Promise.all([
      db.from("orders").select("*"),
      db
        .from("payments")
        .select("*")
        .order("payment_date", {
          ascending:false
        })
    ]);

    if (ordersResult.error) {
      throw ordersResult.error;
    }

    if (paymentsResult.error) {
      throw paymentsResult.error;
    }

    const orders =
      ordersResult.data || [];

    const payments =
      paymentsResult.data || [];

    const orderValue =
      orders.reduce(
        (sum,x) =>
          sum + Number(x.grand_total || 0),
        0
      );

    const received =
      payments.reduce(
        (sum,x) =>
          sum + Number(x.amount || 0),
        0
      );

    const remaining =
      Math.max(
        0,
        orderValue - received
      );

    const paidOrders =
      orders.filter(
        x => x.payment_status === "lunas"
      ).length;

    document.getElementById("financeStats").innerHTML = `
      <div class="stat">
        <span>Nilai Semua Order</span>
        <strong style="font-size:18px">
          ${MemoraAdmin.money(orderValue)}
        </strong>
      </div>

      <div class="stat">
        <span>Pembayaran Diterima</span>
        <strong style="font-size:18px">
          ${MemoraAdmin.money(received)}
        </strong>
      </div>

      <div class="stat">
        <span>Belum Lunas</span>
        <strong style="font-size:18px">
          ${MemoraAdmin.money(remaining)}
        </strong>
      </div>

      <div class="stat">
        <span>Order Lunas</span>
        <strong>${paidOrders}</strong>
      </div>
    `;

    document.getElementById("financeRows").innerHTML =
      payments.map(item => `
        <tr>
          <td>${MemoraAdmin.date(item.payment_date)}</td>
          <td>${MemoraAdmin.escapeHtml(item.order_id)}</td>
          <td>${MemoraAdmin.escapeHtml(item.payment_type || "-")}</td>
          <td>${MemoraAdmin.escapeHtml(item.payment_method || "-")}</td>
          <td><strong>${MemoraAdmin.money(item.amount)}</strong></td>
        </tr>
      `).join("") ||
      `<tr><td colspan="5" class="empty">Belum ada pembayaran.</td></tr>`;

  });

});