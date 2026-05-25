// Blue Collar Employee Dashboard
// Path: views/frontend/kullanicilar/SalaryDashboard.js

window.Kullanicilar = window.Kullanicilar || {};

window.Kullanicilar.SalaryDashboard = ({ user }) => {

    // Calculate Paid Amount from Total - Balance
    // Assuming 'salary' is the monthly total, and 'salary_balance' is what is left to be paid.
    const totalSalary = parseFloat(user.salary) || 0;
    const remainingBalance = parseFloat(user.salary_balance) || 0;
    const paidAmount = totalSalary - remainingBalance;

    // Determine Status Color based on payments
    const paymentProgress = totalSalary > 0 ? (paidAmount / totalSalary) * 100 : 0;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Hoş Geldin, {user.name}</h1>
                    <p className="text-gray-500 text-sm">Finansal Durum Raporu</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                    Mavi Yaka Personel
                </div>
            </div>

            {/* Main Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Maaş Kartı */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-gray-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <div className="relative z-10">
                        <p className="text-gray-500 font-medium text-sm mb-1">Maaş Hakedişi</p>
                        <h3 className="text-3xl font-bold text-gray-800">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalSalary)}
                        </h3>
                        <div className="mt-4 flex items-center text-xs text-gray-400">
                            <i className="fas fa-calendar-check mr-2"></i> Bu Ay
                        </div>
                    </div>
                </div>

                {/* 2. Ödenen / Avans */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                    <div className="relative z-10">
                        <p className="text-orange-600 font-medium text-sm mb-1">Ödenen / Avans</p>
                        <h3 className="text-3xl font-bold text-orange-600">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(paidAmount)}
                        </h3>
                        <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${paymentProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* 3. Kalan Bakiye (Cebine Girecek) */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 shadow-xl shadow-green-500/30 relative overflow-hidden text-white">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                    <div className="relative z-10">
                        <p className="text-green-100 font-medium text-sm mb-1">Kalan Bakiye</p>
                        <h3 className="text-4xl font-extrabold tracking-tight">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(remainingBalance)}
                        </h3>
                        <p className="text-xs text-green-100 mt-4 opacity-80">Hesabınıza yatacak net tutar</p>
                    </div>
                </div>

            </div>

            {/* Quick Actions for Blue Collar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avans İste */}
                <button className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xl">
                            <i className="fas fa-hand-holding-usd"></i>
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-800 group-hover:text-brand-600 transition">Avans Talep Et</h4>
                            <p className="text-xs text-gray-400">Acil nakit ihtiyacınız mı var?</p>
                        </div>
                    </div>
                    <i className="fas fa-chevron-right text-gray-300"></i>
                </button>

                {/* Bordro Görüntüle */}
                <button className="group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                            <i className="fas fa-file-invoice-dollar"></i>
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-800 group-hover:text-brand-600 transition">Bordro Görüntüle</h4>
                            <p className="text-xs text-gray-400">Son ay maaş dökümünüz</p>
                        </div>
                    </div>
                    <i className="fas fa-chevron-right text-gray-300"></i>
                </button>
            </div>

            {/* Notification Banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
                <i className="fas fa-info-circle text-indigo-500 mt-1"></i>
                <div>
                    <h4 className="font-bold text-indigo-900 text-sm">Bilgilendirme</h4>
                    <p className="text-xs text-indigo-700 mt-1">
                        Maaş ödemeleriniz her ayın 1'i ile 5'i arasında banka hesabınıza yatırılacaktır. Sorun yaşarsanız İK departmanı ile iletişime geçiniz.
                    </p>
                </div>
            </div>

        </div>
    );
};
