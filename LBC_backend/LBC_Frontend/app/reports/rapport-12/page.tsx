import React from 'react';

const federationHeader = {
  title: 'FEDERATION CAMEROUNAISE DE BASKETBALL',
  league: 'LIGUE DE BASKETBALL DU CENTRE',
  address: '1er Étage face carrefour régie – BP 1107 YAOUNDE',
  phones: '(+237) 690 450 998 / 651 196 152',
  email: 'liguedebasketducentre@gmail.com'
};

const reportMeta = {
  season: 'Saison sportive 2024 – 2025',
  reportTitle: 'RAPPORT COMMISSION SPORTIVE N°12',
  date: 'Yaoundé, le 12 mai 2025',
  secretary: 'Le Secrétaire Général'
};

const resultsA = [
  {
    day: 'Samedi, 10 mai 2025',
    matches: [
      { category: 'U18 FILLES', results: ['SANTA B.  17 – 45  FUSEE'] },
      { category: 'L2A MESSIEURS', results: ['ALPH2   42 – 47  MENDONG', 'LENA   37 – 41  KLOES YD2'] },
      { category: 'L2B MESSIEURS', results: ['APEJES2  25 – 60  MBALMAYO', 'PHISLAMA  49 – 73  MBALMAYO'] },
      { category: 'DAMES', results: ['FAP2   38 – 26  MC NOAH'] },
      { category: 'L1 MESSIEURS', results: ['MC NOAH  71 – 58  NYBA'] }
    ]
  },
  {
    day: 'Dimanche, 11 mai 2025',
    matches: [
      { category: 'L2B MESSIEURS', results: ['MBOA BB  20 – 00  SANTA B.', 'PHISLAMA  52 – 59  HAND OF GOD'] },
      { category: 'L2A MESSIEURS', results: ['MESSASSI  71 – 73  AS KEEP', 'ALL SPORT  49 – 37  BOFIA', 'SEED EXP.  29 – 50  FUSEE', 'MARY JO  51 – 70  APEJES'] },
      { category: 'DAMES', results: ['ONYX   41 – 65  OVERDOSE', 'LENA   24 – 32  AS KEEP2'] },
      { category: 'L1 MESSIEURS', results: ['ETOUDI  61 – 79  WILDCATS', 'FALCONS  67 – 78  ANGELS'] }
    ]
  }
];

const decisionsB = 'Toutes les rencontres sont homologuées sous les scores acquis sur le terrain.';

const sanctionsC = {
  heading: 'RECAPITULATIF DES SANCTIONS DU 11eme REGROUPEMENT',
  columns: ['DATES', 'NOMS', 'N° EQUIPES', 'CATEGORIES', 'SANCTIONS', 'MONTANTS', 'OBSERVATION'],
  rows: [
    ['10/05/25', 'ESSENA L.', '11', 'MC NOAH', 'DAMES Antisportive (U2)', '2 000', 'IMPAYÉ'],
    ['10/05/25', 'ANGO D.', '12', 'MC NOAH', 'MESSIEURS L1 Antisportive (U2)', '2 000', 'IMPAYÉ'],
    ['11/05/25', 'NGONO C.', '12', 'SEED EXP.', 'MESSIEURS L2A Antisportive (U2)', '2 000', 'IMPAYÉ'],
    ['11/05/25', 'MELI COACH', '', 'LENA', 'DAMES Technique (B1)', '4 000', 'IMPAYÉ'],
    ['11/05/25', 'HOPP D.', '24', 'PHISLAMA', 'MESSIEURS L2B Antisportive (U2)', '2 000', 'IMPAYÉ'],
    ['11/05/25', 'ANOMBOGO P.', '17', 'MARY JO', 'MESSIEURS L2B Technique (T1)', '2 000', 'IMPAYÉ'],
    ['11/05/25', 'NDZIE X. COACH', '', 'SANTA B.', 'MESSIEURS L2B Forfait', '10 000', 'IMPAYÉ']
  ],
  note: "NB : AUCUN(E) N'EQUIPE/JOUEUR NE JOUERA SANS S'ETRE ACQUITTE DE TOUTES SES SANCTIONS.\nCE RAPPORT FAISANT OFFICE DE NOTIFICATION EN PLUS DES SOUCHES DES FEUILLES DE MARQUE QUI SONT REMISES AUX EQUIPES APRES LES RENCONTRES"
};

const classificationsD = [
  {
    title: 'CATEGORIE U18 FILLES',
    headers: ['RANG', 'EQUIPES', 'Matchs joués', 'Victoires', 'Défaites', 'Points', 'Points scorés', 'Différence'],
    rows: [
      ['1er', 'LENA', '7', '6', '1', '13', '270', '155', '+115'],
      ['2e', 'FAP', '5', '5', '0', '10', '281', '156', '+125'],
      ['3e', 'FX VOGT', '5', '4', '1', '9', '200', '105', '+95'],
      ['4e', 'MARIK KLOES', '5', '4', '1', '9', '197', '115', '+82'],
      ['5e', 'FUSEE', '6', '3', '3', '9', '250', '231', '+19'],
      ['6e', 'DESBA', '5', '3', '2', '8', '148', '160', '-12'],
      ['7e', 'SANTA BARBARA', '6', '2', '4', '8', '149', '166', '-17'],
      ['8e', 'ONYX', '4', '3', '1', '7', '164', '129', '+35'],
      ['9e', 'FRIENDSHIP', '5', '1', '4', '6', '155', '163', '-8'],
      ['10e', 'PLAY2LEAD', '5', '1', '4', '6', '141', '163', '-22'],
      ['11e', 'FALCONS', '5', '1', '4', '6', '97', '222', '-125'],
      ['12e', 'OL. DE MEYO', '5', '0', '5', '5', '12', '249', '-237'],
      ['13e', '3A BB', '4', '1', '3', '4', '84', '114', '-30']
    ]
  },
  // ... (other classification tables remain the same)
];

const statsE = {
  heading: 'STATISTIQUE D\'EVOLUTION DU CHAMPIONAT EN POURCENTAGE',
  note: 'NB : Ces données statistiques ne tiennent pas compte des phases de play-offs.'
};

export default function Report12Page() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <header className="px-6 py-8 border-b border-gray-100 bg-gradient-to-r from-indigo-700 to-orange-500 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-sm font-semibold tracking-widest">{federationHeader.title}</h1>
              <h2 className="text-xl font-bold mt-1">{federationHeader.league}</h2>
              <p className="text-xs mt-2 opacity-90">{federationHeader.address} – TEL {federationHeader.phones} – email : {federationHeader.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">{reportMeta.season}</p>
              <p className="text-lg font-bold mt-2">{reportMeta.reportTitle}</p>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10">
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-3">A. RESULTATS DES RENCONTRES DU DOUZIEME REGROUPEMENT</h3>

            {resultsA.map((block) => (
              <div key={block.day} className="mb-6">
                <div className="font-medium mb-2">{block.day}</div>
                <div className="space-y-3">
                  {block.matches.map((m, i) => (
                    <div key={i} className="bg-gray-50 rounded-md p-3 border border-gray-100">
                      <div className="font-semibold text-sm mb-1">{m.category}</div>
                      <ul className="list-disc list-inside text-sm leading-relaxed">
                        {m.results.map((r, j) => (
                          <li key={j} className="whitespace-pre-wrap">{r}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-3">B. DECISIONS</h3>
            <p className="bg-gray-50 p-4 rounded border border-gray-100">{decisionsB}</p>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-3">C. {sanctionsC.heading}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    {sanctionsC.columns.map((c) => (
                      <th key={c} className="px-3 py-2 text-left font-medium border border-gray-200">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sanctionsC.rows.map((r, idx) => (
                    <tr key={idx} className="even:bg-white odd:bg-gray-50">
                      {r.map((cell, i) => (
                        <td key={i} className="px-3 py-2 border border-gray-100 whitespace-pre-wrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-xs text-gray-700 whitespace-pre-wrap">{sanctionsC.note}</div>
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">D. CLASSEMENT PROVISOIRE</h3>
            {classificationsD.map((table, idx) => (
              <div key={idx} className="mb-8">
                <h4 className="font-semibold mb-2">{table.title}</h4>
                <div className="overflow-x-auto border rounded-md">
                  <table className="min-w-full text-sm table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        {table.headers.map((h, i) => (
                          <th key={i} className="px-3 py-2 text-left border border-gray-200 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="odd:bg-white even:bg-gray-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 border border-gray-100 whitespace-pre-wrap">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </section>

          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-3">E. {statsE.heading}</h3>
            <p className="text-sm mb-3">{statsE.note}</p>

            <div className="bg-gray-50 p-4 rounded border border-gray-100 text-sm">
              <p>U18 Filles / U18 Garçons / Messieurs L2B / Messieurs L2A / Dames / Messieurs L1 — Totaux</p>
              <div className="mt-3">
                <table className="w-full text-sm table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-2 border">Totaux</th>
                      <th className="px-2 py-2 border">PA</th>
                      <th className="px-2 py-2 border">PB</th>
                      <th className="px-2 py-2 border">PC</th>
                      <th className="px-2 py-2 border">TO</th>
                      <th className="px-2 py-2 border">PA</th>
                      <th className="px-2 py-2 border">PB</th>
                      <th className="px-2 py-2 border">TO</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2 py-2 border">Matchs à jouer</td>
                      <td className="px-2 py-2 border">78</td>
                      <td className="px-2 py-2 border">45</td>
                      <td className="px-2 py-2 border">36</td>
                      <td className="px-2 py-2 border">36</td>
                      <td className="px-2 py-2 border">117</td>
                      <td className="px-2 py-2 border">45</td>
                      <td className="px-2 py-2 border">36</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2 border">Matchs joués</td>
                      <td className="px-2 py-2 border">34</td>
                      <td className="px-2 py-2 border">18</td>
                      <td className="px-2 py-2 border">17</td>
                      <td className="px-2 py-2 border">17</td>
                      <td className="px-2 py-2 border">52</td>
                      <td className="px-2 py-2 border">30</td>
                      <td className="px-2 py-2 border">24</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-2 border">%</td>
                      <td className="px-2 py-2 border">43,6</td>
                      <td className="px-2 py-2 border">40,00</td>
                      <td className="px-2 py-2 border">47,22</td>
                      <td className="px-2 py-2 border">47,22</td>
                      <td className="px-2 py-2 border">44,44</td>
                      <td className="px-2 py-2 border">66,66</td>
                      <td className="px-2 py-2 border">66,66</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="mt-8 text-sm text-gray-700">
            <div className="font-medium">{reportMeta.date}</div>
            <div className="mt-2">{reportMeta.secretary}</div>
          </footer>
        </main>
      </div>
    </div>
  );
}
