document.addEventListener("DOMContentLoaded", () => {

  MemoraAdmin.start(async () => {

    const db = MemoraAdmin.db;
    const page = document.getElementById("adminPage");

    page.innerHTML = `
      <div class="page-head">
        <div>
          <div class="eyebrow">Overview</div>
          <h1>Dashboard</h1>
          <p>Ringkasan operasional MEMORA Studio.</p>
        </div>
      </div>

      <div class="stats" id="dashboardStats"></div>

      <div class="grid-2">

        <section class="panel">
          <div class="panel-head">
            <h2>Order Terbaru</h2>
            <a class="btn" href="/studio/orders/">Semua Order</a>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody id="recentOrders"></tbody>
            </table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2>Quick Access</h2>
          </div>

          <div class="panel-body">
            <div style="display:grid;gap:9px">
              <a class="btn" href="/studio/orders/">Orders</a>
              <a class="btn" href="/studio/custom-orders/">Custom Orders</a>
              <a class="btn" href="/studio/payments/">Payment Verification</a>
              <a class="btn" href="/studio/production/">Production</a>
              <a class="btn" href="/studio/invoices/">Invoices</a>
              <a class="btn" href="/studio/finance/">Finance</a>
              <a class="btn" href="/studio/customers/">Customers</a>
              <a class="btn" href="/studio/products/">Products</a>
              <a class="btn" href="/studio/gallery/">Gallery</a>
              <a class="btn" href="/studio/archive/">Archive</a>
            </div>
          </div>
        </section>

      </div>
    `;

    const { data:orders, error } =
      await db
        .from("orders")
        .select("*")
        .order("created_at", {
          ascending:false
        });

    if (error) throw error;

    const rows =
      orders || [];

    const total =
      rows.length;

    const waiting =
      rows.filter(
        x => x.status === "menunggu_konfirmasi"
      ).length;

    const active =
      rows.filter(
        x => !["selesai","dibatalkan"].includes(x.status)
      ).length;

    const revenue =
      rows.reduce(
        (sum,x) =>
          sum + Number(x.total_paid || 0),
        0
      );

    document.getElementById("dashboardStats").innerHTML = `
      <div class="stat">
        <span>Total Order</span>
        <strong>${total}</strong>
        <small>Semua pesanan</small>
      </div>

      <div class="stat">
        <span>Menunggu Konfirmasi</span>
        <strong>${waiting}</strong>
        <small>Perlu diperiksa</small>
      </div>

      <div class="stat">
        <span>Order Aktif</span>
        <strong>${active}</strong>
        <small>Belum selesai</small>
      </div>

      <div class="stat">
        <span>Pembayaran Diterima</span>
        <strong style="font-size:18px">
          ${MemoraAdmin.money(revenue)}
        </strong>
        <small>Total paid</small>
      </div>
    `;

    document.getElementById("recentOrders").innerHTML =
      rows.slice(0,7).map(order => `
        <tr>
          <td>
            <a href="/studio/orders/?id=${order.id}">
              <strong>
                ${MemoraAdmin.escapeHtml(order.order_number)}
              </strong>
            </a>
          </td>

          <td>
            <span class="badge">
              ${MemoraAdmin.statusLabel(order.status)}
            </span>
          </td>

          <td>
            ${MemoraAdmin.statusLabel(order.payment_status)}
          </td>

          <td>
            ${MemoraAdmin.money(order.grand_total)}
          </td>

          <td>
            ${MemoraAdmin.date(order.created_at)}
          </td>
        </tr>
      `).join("") ||
      `<tr><td colspan="5" class="empty">Belum ada order.</td></tr>`;

  });

});