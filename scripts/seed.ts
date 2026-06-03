import { prisma } from "../lib/prisma";

const createdAt = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.saleItem.deleteMany();
    await tx.productionOutput.deleteMany();
    await tx.productionIngredient.deleteMany();
    await tx.purchaseItem.deleteMany();
    await tx.sale.deleteMany();
    await tx.production.deleteMany();
    await tx.purchase.deleteMany();
    await tx.product.deleteMany();
    await tx.inventoryItem.deleteMany();
    await tx.activityLog.deleteMany();

    const [kapalSelam, lenjer, adaan, kulit, tekwan] = await Promise.all([
      tx.product.create({
        data: {
          name: "Pempek Kapal Selam",
          quantity: 34,
          priceDefault: 18000,
          priceReseller: 15000,
          priceOnline: 20000,
          note: "Best seller dengan telur utuh",
          createdAt: createdAt(8),
        },
      }),
      tx.product.create({
        data: {
          name: "Pempek Lenjer",
          quantity: 58,
          priceDefault: 12000,
          priceReseller: 9500,
          priceOnline: 14000,
          note: "Stok siap jual ukuran besar",
          createdAt: createdAt(8),
        },
      }),
      tx.product.create({
        data: {
          name: "Pempek Adaan",
          quantity: 42,
          priceDefault: 6000,
          priceReseller: 5000,
          priceOnline: 7000,
          note: "Varian goreng langsung santap",
          createdAt: createdAt(7),
        },
      }),
      tx.product.create({
        data: {
          name: "Pempek Kulit",
          quantity: 27,
          priceDefault: 6000,
          priceReseller: 5000,
          priceOnline: 7000,
          note: "Renyah untuk paket campur",
          createdAt: createdAt(7),
        },
      }),
      tx.product.create({
        data: {
          name: "Tekwan Frozen",
          quantity: 19,
          priceDefault: 22000,
          priceReseller: 18500,
          priceOnline: 25000,
          note: "Paket kuah frozen 1 porsi",
          createdAt: createdAt(6),
        },
      }),
    ]);

    const [ikanGiling, tepungSagu, telur, bawangPutih, cuko] = await Promise.all([
      tx.inventoryItem.create({
        data: {
          name: "Ikan tenggiri giling",
          quantity: 18,
          unitPrice: 85000,
          note: "Kg, stok bahan utama",
          createdAt: createdAt(9),
        },
      }),
      tx.inventoryItem.create({
        data: {
          name: "Tepung sagu",
          quantity: 35,
          unitPrice: 18000,
          note: "Kg, karung terbuka",
          createdAt: createdAt(9),
        },
      }),
      tx.inventoryItem.create({
        data: {
          name: "Telur ayam",
          quantity: 72,
          unitPrice: 2500,
          note: "Butir untuk kapal selam",
          createdAt: createdAt(8),
        },
      }),
      tx.inventoryItem.create({
        data: {
          name: "Bawang putih",
          quantity: 5,
          unitPrice: 30000,
          note: "Kg untuk adonan dan kuah",
          createdAt: createdAt(8),
        },
      }),
      tx.inventoryItem.create({
        data: {
          name: "Cuko botol",
          quantity: 90,
          unitPrice: 3500,
          note: "Botol 250 ml",
          createdAt: createdAt(7),
        },
      }),
    ]);

    await Promise.all([
      tx.purchase.create({
        data: {
          name: "Belanja bahan baku",
          quantity: 54,
          amount: 2305000,
          note: "Restock ikan, sagu, dan telur dari pasar 16 Ilir",
          date: createdAt(6),
          createdAt: createdAt(6),
          items: {
            create: [
              { name: ikanGiling.name, quantity: 20, price: 85000 },
              { name: tepungSagu.name, quantity: 25, price: 18000 },
              { name: telur.name, quantity: 9, price: 17200 },
            ],
          },
        },
      }),
      tx.purchase.create({
        data: {
          name: "Belanja bahan baku",
          quantity: 110,
          amount: 450000,
          note: "Tambahan cuko dan bumbu harian",
          date: createdAt(2),
          createdAt: createdAt(2),
          items: {
            create: [
              { name: cuko.name, quantity: 100, price: 3500 },
              { name: bawangPutih.name, quantity: 10, price: 10000 },
            ],
          },
        },
      }),
    ]);

    await Promise.all([
      tx.production.create({
        data: {
          name: "Pempek Kapal Selam, Pempek Lenjer",
          quantity: 78,
          note: "Produksi pagi untuk stok etalase dan reseller",
          createdAt: createdAt(5),
          ingredients: {
            create: [
              { inventoryItemId: ikanGiling.id, quantity: 8 },
              { inventoryItemId: tepungSagu.id, quantity: 12 },
              { inventoryItemId: telur.id, quantity: 36 },
            ],
          },
          outputs: {
            create: [
              { productId: kapalSelam.id, quantity: 28 },
              { productId: lenjer.id, quantity: 50 },
            ],
          },
        },
      }),
      tx.production.create({
        data: {
          name: "Pempek Adaan, Pempek Kulit, Tekwan Frozen",
          quantity: 95,
          note: "Produksi variasi untuk paket campur akhir pekan",
          createdAt: createdAt(3),
          ingredients: {
            create: [
              { inventoryItemId: ikanGiling.id, quantity: 6 },
              { inventoryItemId: tepungSagu.id, quantity: 9 },
              { inventoryItemId: bawangPutih.id, quantity: 2 },
            ],
          },
          outputs: {
            create: [
              { productId: adaan.id, quantity: 40 },
              { productId: kulit.id, quantity: 35 },
              { productId: tekwan.id, quantity: 20 },
            ],
          },
        },
      }),
    ]);

    const [sale1, sale2, sale3] = await Promise.all([
      tx.sale.create({
        data: {
          name: "Pempek Kapal Selam x3 (Normal), Pempek Lenjer x5 (Normal)",
          quantity: 8,
          amount: 114000,
          note: "Checkout kasir (Normal)",
          createdAt: createdAt(1),
          items: {
            create: [
              { productId: kapalSelam.id, priceKind: "default", quantity: 3, unitPrice: 18000 },
              { productId: lenjer.id, priceKind: "default", quantity: 5, unitPrice: 12000 },
            ],
          },
        },
      }),
      tx.sale.create({
        data: {
          name: "Pempek Adaan x12 (Reseller), Pempek Kulit x10 (Reseller)",
          quantity: 22,
          amount: 110000,
          note: "Checkout kasir (Reseller)",
          createdAt: createdAt(1),
          items: {
            create: [
              { productId: adaan.id, priceKind: "reseller", quantity: 12, unitPrice: 5000 },
              { productId: kulit.id, priceKind: "reseller", quantity: 10, unitPrice: 5000 },
            ],
          },
        },
      }),
      tx.sale.create({
        data: {
          name: "Tekwan Frozen x4 (Online), Pempek Kapal Selam x2 (Online)",
          quantity: 6,
          amount: 140000,
          note: "Checkout kasir (Online)",
          createdAt: new Date(),
          items: {
            create: [
              { productId: tekwan.id, priceKind: "online", quantity: 4, unitPrice: 25000 },
              { productId: kapalSelam.id, priceKind: "online", quantity: 2, unitPrice: 20000 },
            ],
          },
        },
      }),
    ]);

    await tx.activityLog.createMany({
      data: [
        { kind: "product", action: "created", description: 'Created product "Pempek Kapal Selam"', entityId: kapalSelam.id, createdAt: createdAt(8) },
        { kind: "product", action: "created", description: 'Created product "Pempek Lenjer"', entityId: lenjer.id, createdAt: createdAt(8) },
        { kind: "product", action: "created", description: 'Created product "Pempek Adaan"', entityId: adaan.id, createdAt: createdAt(7) },
        { kind: "product", action: "created", description: 'Created product "Pempek Kulit"', entityId: kulit.id, createdAt: createdAt(7) },
        { kind: "product", action: "created", description: 'Created product "Tekwan Frozen"', entityId: tekwan.id, createdAt: createdAt(6) },
        { kind: "inventory", action: "created", description: 'Created inventory item "Ikan tenggiri giling"', entityId: ikanGiling.id, createdAt: createdAt(9) },
        { kind: "inventory", action: "created", description: 'Created inventory item "Tepung sagu"', entityId: tepungSagu.id, createdAt: createdAt(9) },
        { kind: "inventory", action: "created", description: 'Created inventory item "Telur ayam"', entityId: telur.id, createdAt: createdAt(8) },
        { kind: "inventory", action: "created", description: 'Created inventory item "Bawang putih"', entityId: bawangPutih.id, createdAt: createdAt(8) },
        { kind: "inventory", action: "created", description: 'Created inventory item "Cuko botol"', entityId: cuko.id, createdAt: createdAt(7) },
        {
          kind: "purchase",
          action: "created",
          description: "Created purchase (3 items: Ikan tenggiri giling, Tepung sagu, Telur ayam)",
          metadata: {
            amount: 2305000,
            quantity: 54,
            items: [
              { name: ikanGiling.name, quantity: 20, unitPrice: 85000, amount: 1700000 },
              { name: tepungSagu.name, quantity: 25, unitPrice: 18000, amount: 450000 },
              { name: telur.name, quantity: 9, unitPrice: 17200, amount: 154800 },
            ],
          },
          createdAt: createdAt(6),
        },
        {
          kind: "purchase",
          action: "created",
          description: "Created purchase (2 items: Cuko botol, Bawang putih)",
          metadata: {
            amount: 450000,
            quantity: 110,
            items: [
              { name: cuko.name, quantity: 100, unitPrice: 3500, amount: 350000 },
              { name: bawangPutih.name, quantity: 10, unitPrice: 10000, amount: 100000 },
            ],
          },
          createdAt: createdAt(2),
        },
        {
          kind: "production",
          action: "created",
          description: 'Created production "Pempek Kapal Selam, Pempek Lenjer"',
          metadata: {
            quantity: 78,
            outputs: [
              { name: kapalSelam.name, quantity: 28 },
              { name: lenjer.name, quantity: 50 },
            ],
            ingredients: [
              { name: ikanGiling.name, quantity: 8 },
              { name: tepungSagu.name, quantity: 12 },
              { name: telur.name, quantity: 36 },
            ],
          },
          createdAt: createdAt(5),
        },
        {
          kind: "production",
          action: "created",
          description: 'Created production "Pempek Adaan, Pempek Kulit, Tekwan Frozen"',
          metadata: {
            quantity: 95,
            outputs: [
              { name: adaan.name, quantity: 40 },
              { name: kulit.name, quantity: 35 },
              { name: tekwan.name, quantity: 20 },
            ],
            ingredients: [
              { name: ikanGiling.name, quantity: 6 },
              { name: tepungSagu.name, quantity: 9 },
              { name: bawangPutih.name, quantity: 2 },
            ],
          },
          createdAt: createdAt(3),
        },
        {
          kind: "sale",
          action: "checked_out",
          description: "Checked out cart (2 items)",
          entityId: sale1.id,
          metadata: {
            amount: 114000,
            amountPaid: 114000,
            change: 0,
            paymentMethod: "cash",
            quantity: 8,
            items: [
              { name: kapalSelam.name, quantity: 3, unitPrice: 18000, amount: 54000 },
              { name: lenjer.name, quantity: 5, unitPrice: 12000, amount: 60000 },
            ],
          },
          createdAt: createdAt(1),
        },
        {
          kind: "sale",
          action: "checked_out",
          description: "Checked out cart (2 items)",
          entityId: sale2.id,
          metadata: {
            amount: 110000,
            amountPaid: 110000,
            change: 0,
            paymentMethod: "cash",
            quantity: 22,
            items: [
              { name: adaan.name, quantity: 12, unitPrice: 5000, amount: 60000 },
              { name: kulit.name, quantity: 10, unitPrice: 5000, amount: 50000 },
            ],
          },
          createdAt: createdAt(1),
        },
        {
          kind: "sale",
          action: "checked_out",
          description: "Checked out cart (2 items)",
          entityId: sale3.id,
          metadata: {
            amount: 140000,
            amountPaid: 140000,
            change: 0,
            paymentMethod: "cash",
            quantity: 6,
            items: [
              { name: tekwan.name, quantity: 4, unitPrice: 25000, amount: 100000 },
              { name: kapalSelam.name, quantity: 2, unitPrice: 20000, amount: 40000 },
            ],
          },
          createdAt: new Date(),
        },
      ],
    });
  });

  console.log("Seeded mock pempek business data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
