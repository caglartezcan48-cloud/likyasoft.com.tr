// Vizyon Component
// Path: views/frontend/anasayfa/Vizyon.js

window.Anasayfa = window.Anasayfa || {};

window.Anasayfa.Vizyon = ({ t }) => (
    <section id="vizyon" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">

            {/* LİKYA PAY NEDİR? */}
            <div className="mb-20">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t.what_is_title}</h2>
                    <div className="w-24 h-1 bg-brand-500 mx-auto rounded-full"></div>
                </div>
                <div className="bg-blue-50 rounded-3xl p-8 md:p-12 border border-blue-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl text-blue-900 -mr-10 -mt-10">
                        <i className="fas fa-question"></i>
                    </div>
                    <ul className="space-y-6 relative z-10">
                        <li className="flex items-start p-4 hover:bg-white/50 rounded-2xl transition duration-300 hover:shadow-lg hover:scale-105 cursor-default group">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30 group-hover:bg-blue-700 transition">
                                <i className="fas fa-network-wired"></i>
                            </div>
                            <div className="ml-6">
                                <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition">{t.card_1_title}</h4>
                                <p className="text-slate-600">{t.card_1_desc}</p>
                            </div>
                        </li>
                        <li className="flex items-start p-4 hover:bg-white/50 rounded-2xl transition duration-300 hover:shadow-lg hover:scale-105 cursor-default group">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30 group-hover:bg-blue-700 transition">
                                <i className="fas fa-handshake"></i>
                            </div>
                            <div className="ml-6">
                                <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition">{t.card_2_title}</h4>
                                <p className="text-slate-600">{t.card_2_desc}</p>
                            </div>
                        </li>
                        <li className="flex items-start p-4 hover:bg-white/50 rounded-2xl transition duration-300 hover:shadow-lg hover:scale-105 cursor-default group">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30 group-hover:bg-blue-700 transition">
                                <i className="fas fa-robot"></i>
                            </div>
                            <div className="ml-6">
                                <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition">{t.card_3_title}</h4>
                                <p className="text-slate-600">{t.card_3_desc}</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* SİSTEM NASIL KAR EDER / ÇALIŞIR */}
            <div id="nasil-calisir" className="mb-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">{t.how_works_title}</h2>
                    <div className="w-24 h-1 bg-green-500 mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">1</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_1_title}</h3>
                        <p className="text-slate-600">{t.step_1_desc}</p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">2</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_2_title}</h3>
                        <p className="text-slate-600">{t.step_2_desc}</p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">3</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_3_title}</h3>
                        <p className="text-slate-600">{t.step_3_desc}</p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 hover:-translate-y-2 transition duration-300">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-2xl mb-6">4</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">{t.step_4_title}</h3>
                        <p className="text-slate-600">{t.step_4_desc}</p>
                    </div>

                    {/* Step 5 */}
                    <div className="bg-green-600 p-8 rounded-2xl shadow-lg text-white hover:-translate-y-2 transition duration-300 lg:col-span-2">
                        <div className="flex items-center mb-6">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center font-bold text-2xl mr-4"><i className="fas fa-coins"></i></div>
                            <h3 className="text-2xl font-bold">{t.profit_model_title}</h3>
                        </div>
                        <p className="text-green-50 text-lg">
                            {t.profit_model_desc}
                        </p>
                    </div>
                </div>
            </div>

        </div>
    </section>
);
