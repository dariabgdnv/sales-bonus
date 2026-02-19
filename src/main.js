/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */

// Расчет выручки
function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;
    const discountCoefficient = 1 - (discount / 100);
    return sale_price * quantity * discountCoefficient;
}

// Расчет бонусов
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;

    if (index === 0) {
        return profit * 0.15;
    }
    else if (index === 1 || index === 2) {
        return profit * 0.10;
    }
    else if (index === total - 1) {
        return 0;
    }
    else {
        return profit * 0.05;
    }
}

// Расчет Основная функция
function analyzeSalesData(data, options) {

    // Проверка данных
    if (!data
        || !Array.isArray(data.sellers)
        || !Array.isArray(data.products)
        || !Array.isArray(data.purchase_records)
        || data.sellers.length === 0
        || data.products.length === 0
        || data.purchase_records.length === 0
    ) {
        throw new Error('Некорректные входные данные');
    }

    const { calculateRevenue, calculateBonus } = options;

    // Проверка на наличие переменных
    if (!calculateRevenue || !calculateBonus) {
        throw new Error('Отсутствуют требуемые функции в опциях');
    }
    console.log('Все проверки пройдены!');

    // Проверка на функцию
    if (typeof calculateRevenue !== 'function' || typeof calculateBonus !== 'function') {
        throw new Error('Переданные опции должны быть функциями');
    }

    console.log('Все проверки пройдены! Можно работать дальше');

    // Создание словаря
    const sellersID = {};

    data.sellers.forEach(seller => {
        // Для каждого продавца создаем объект с начальными значениями
        sellersID[seller.id] = {
            id: seller.id,
            name: `${seller.first_name} ${seller.last_name}`,
            revenue: 0,
            profit: 0,
            sales_count: 0,
            products_sold: {}
        };
    });
    console.log(sellersID);

    // Статистика для каждого продавца
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    // Создание индексов
    const sellerIndex = Object.fromEntries(
        sellerStats.map(seller => [seller.id, seller])
    );

    const productIndex = Object.fromEntries(
        data.products.map(product => [product.sku, product])
    );

    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];

        seller.sales_count++;
        seller.revenue += record.total_amount;

        record.items.forEach(item => {
            const product = productIndex[item.sku];

            const revenue = calculateRevenue(item, product);

            const cost = product.purchase_price * item.quantity;

            const profit = revenue - cost;

            seller.profit += profit;

            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });
    });

    sellerStats.forEach(seller => {
        seller.revenue = seller.revenue || 0;
        seller.profit = seller.profit || 0;
    });

    // Сортировка продавцов по прибыли
    sellerStats.sort((a, b) => b.profit - a.profit);

    sellerStats.forEach((seller, index) => {
        const place = index + 1;
        const totalSellers = sellerStats.length;
        seller.bonus = calculateBonus(index, totalSellers, seller);

        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    return sellerStats.map(seller => ({
        seller_id: seller.id.toString(),
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));
}