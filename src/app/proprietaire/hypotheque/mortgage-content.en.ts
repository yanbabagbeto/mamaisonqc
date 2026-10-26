import type { MortgagePage } from "./mortgage-content";

export const MORTGAGE_PAGES_EN: MortgagePage[] = [
  {
    slug: "renouvellement-hypothecaire",
    navLabel: "Mortgage renewal",
    title: "Renewing your mortgage without signing blind",
    metaTitle: "Mortgage renewal: check before you sign",
    metaDescription:
      "At the end of your term, compare your lender's renewal offer with other quotes, and check the penalty and the fees before you sign anything.",
    intro: [
      "Your lender sends you a renewal offer before your term ends. That letter is not an obligation: you can accept it, negotiate it, move your mortgage elsewhere or pay off the balance. Many homeowners sign without comparing, simply because the document looks like a formality. The letter often arrives when the owner has the least time to compare.",
      "Renewal is still the best moment to review your rate, your amortization and your conditions. Once the new term is signed, the options close for several years.",
    ],
    sections: [
      {
        heading: "What really happens at the end of your term",
        paragraphs: [
          "A term is the period during which your rate and conditions stay in force. Amortization describes the number of years planned to repay the entire loan. At the end of the term, the lender offers you a new contract: new rate, new conditions, and sometimes new fees.",
          "Nothing forces you to accept the first offer. You can ask your current lender for a better combination, shop with a mortgage broker or transfer the mortgage. You simply have to respect the deadlines set out in your contract and in the renewal letter.",
        ],
      },
      {
        heading: "Fixed or variable rate: two ways to carry the risk",
        paragraphs: [
          "With a fixed rate, the rate and usually the payment stay the same for the whole term. You know your cost, but you give up benefiting from a drop during that period.",
          "With a variable rate, the rate follows the lender's index or reference rate. The payment can change, or the portion applied to principal can vary depending on the contract. That choice depends on your tolerance for variation and on your budget room, not only on the rate of the day.",
          "Neither formula is better in itself. What matters is your ability to absorb an increase without compromising your other obligations.",
        ],
      },
      {
        heading: "The prepayment penalty, to check before you switch",
        paragraphs: [
          "If you repay more than your contract allows, or if you transfer your loan before the end of the term, a penalty may apply. Its amount depends on the lender, the product, the current rate and the time remaining.",
          "Some lenders calculate it on a rate differential, others on a number of interest payments. The exact method and the amount cannot be guessed: ask for a written estimate before making a decision. A broker can tell you whether the transfer is worth it given the rate gap.",
        ],
      },
      {
        heading: "What the lender reviews before offering you a rate",
        paragraphs: [
          "The rate offered depends on your file, not only on the market. The lender looks at your income, your debts, your credit history, the value of the property and the loan-to-value ratio. It also assesses the type of property and the strength of the security.",
          "Two neighbours with similar houses can receive different offers. That is why comparing rates with friends or with ads says nothing about your real situation. A solid file does not guarantee the best rate, but it widens the options.",
        ],
      },
      {
        heading: "Compare the total cost, not just the posted rate",
        paragraphs: [
          "A lower rate can hide higher fees: appraisal, notarized deed, transfer, insurance or penalty. Ask for the total cost over the term and the prepayment conditions for each quote. Also ask whether fees apply to a transfer within the same lender.",
          "Rates, fees and penalties vary by lender, product and your file; confirm your situation with a mortgage broker or your lender. A rate gap can look small at signing, but it matters over the term.",
          "Keep in mind too that renewal is not a race. A few days of reflection can prevent years of poorly suited conditions.",
        ],
      },
    ],
    checklist: [
      "Ask your current lender for a written estimate of the prepayment penalty.",
      "Confirm the exact end date of your term and the response deadline requested.",
      "Ask a mortgage broker to compare the renewal offer with at least one other quote.",
      "Check which fees are included in each offer and who pays them.",
      "Reread the prepayment conditions and the possibility of transferring the mortgage.",
    ],
    relatedSlugs: ["refinancer-pour-renover", "consolidation-de-dettes"],
  },
  {
    slug: "refinancer-pour-renover",
    navLabel: "Refinancing to renovate",
    title: "Refinancing to renovate: what the lender looks at",
    metaTitle: "Refinancing to renovate: useful checks",
    metaDescription:
      "Refinancing to pay for renovations puts your home behind a larger debt. Check the ratios, the hidden fees and the municipal permits before you sign.",
    intro: [
      "Refinancing to renovate means replacing your current mortgage with a new one, often larger, to free up equity and pay for the work. Equity is the value of the property minus the loan balance. The process looks like a renewal, but the amount changes everything.",
      "It is a common option when savings are not enough. It also carries a clear risk: the house now secures a larger debt.",
    ],
    sections: [
      {
        heading: "Equity, loan-to-value ratio and borrowing capacity",
        paragraphs: [
          "The loan-to-value ratio compares the loan amount with the value of the property. The higher that ratio, the thinner the lender's safety margin, and the more demanding the conditions can be.",
          "The lender does not always rely on the municipal assessment roll value. It may require an appraisal, sometimes at your expense, to confirm the market value before accepting the new amount. A value lower than expected reduces the amount available, even if your income is solid.",
        ],
      },
      {
        heading: "What the lender wants to know about your work",
        paragraphs: [
          "The nature of the renovations matters. Kitchen or bathroom work presents differently from an addition, a basement to be finished or a structural repair. The lender may ask for quotes, plans or permits.",
          "It also wants to know who will do the work. A licensed contractor, a realistic schedule and permits obtained before the work starts are more reassuring than a vague project.",
          "Work done without a permit can complicate a sale later. The lender and any future buyer will see a risk, and fixing compliance can cost more than doing it right.",
          "Renovations that durably improve the property are generally seen more favourably than those that reflect a personal taste that is hard to resell. A buyer is looking for a functional home, not an exact reflection of the seller's taste.",
        ],
      },
      {
        heading: "The costs people forget in the budget",
        paragraphs: [
          "The amount borrowed is not the total cost of the project. You have to add the appraisal, the notary fees, the penalty if the current term is broken, the permits and a reserve for the unexpected. A detailed quote is worth more than a verbal estimate.",
          "Municipal taxes can rise after a renovation is assessed by the municipality. Plan for that effect in your annual budget, not only in the loan calculation.",
          "Before signing, ask for a written simulation that accounts for the fees and the new assessment. Rates, fees and penalties vary by lender, product and your file; confirm your situation with a mortgage broker or your lender.",
        ],
      },
      {
        heading: "Renovating without mortgaging your future",
        paragraphs: [
          "Refinancing to renovate does not automatically raise the value of the house by the amount spent. The local market, the quality of the work and the balance of the neighbourhood determine what a buyer will agree to pay.",
          "A renovation that is too ambitious for the area can cost more than it returns. It is worth looking at comparable properties and talking with a mortgage broker before setting the budget.",
          "If the project is mostly cosmetic and you plan to sell soon, the question of return deserves an honest answer. A buyer rarely pays the exact cost of the work, even when it is well done.",
        ],
      },
      {
        heading: "A home equity line of credit can be more flexible",
        paragraphs: [
          "A home equity line of credit lets you draw amounts as needed, while a standard refinance releases a fixed sum. The line sometimes suits work done in stages, but it demands discipline: interest accumulates on what is used.",
          "The two options do not work the same way and do not carry the same fees. Ask your mortgage broker to compare them against your actual project rather than an abstract scenario. A line left open can also affect the ratio the lender uses in a future application.",
        ],
      },
    ],
    checklist: [
      "Ask the lender which maximum loan-to-value ratio applies to your file.",
      "Check whether an appraisal of the property will be required and who will pay for it.",
      "Request a written estimate of the penalty if you break your current term.",
      "Check with your municipality whether the work requires a permit.",
      "Compare the total cost of a refinance with that of a home equity line of credit.",
    ],
    relatedSlugs: ["renouvellement-hypothecaire", "vendre-ou-renover"],
  },
  {
    slug: "refinancer-pour-investir",
    navLabel: "Refinancing to invest",
    title: "Refinancing your home to invest in a rental property",
    metaTitle: "Refinancing to invest: what to check",
    metaDescription:
      "Using your home equity to invest in a rental property calls for checks: rental income, loan-to-value ratio, costs and risks before you commit.",
    intro: [
      "Using the equity in your home to buy a rental property is a common strategy in Quebec. It can finance the down payment without selling the house, but it also turns the home into security for a heavier debt.",
      "The project deserves to be assessed like a business, not like an obvious move. Time spent checking the numbers is rarely wasted.",
    ],
    sections: [
      {
        heading: "What equity allows, and what it commits",
        paragraphs: [
          "Available equity is the value of the property minus the mortgage balance and the other charges. The lender may agree to make it accessible through a refinance or a home equity line of credit.",
          "That money is not income: it is additional debt secured by your home. If things get difficult, the lender can exercise recourse against the house, even if the rental property is supposed to repay the loan.",
          "Before borrowing, you also have to check the prepayment clause of the current loan. An unexpected penalty can reduce the equity available at the moment you need it.",
        ],
      },
      {
        heading: "The income test and the ability to carry two debts",
        paragraphs: [
          "The lender calculates your repayment capacity using your income, your existing debts and the new obligation. Rental income is often counted only in part, depending on the lender's rules and on the stability of the leases. A vacant unit does not count the same way as a signed lease.",
          "A project that looks profitable on paper can fail the income test. It is often the net rent, after taxes, insurance, maintenance and condo fees, that determines the real ability to pay. Ask the lender how it treats a future lease or a unit occupied by the owner.",
        ],
      },
      {
        heading: "The loan-to-value ratio of the rental property",
        paragraphs: [
          "Rental properties are generally financed at a more conservative loan-to-value ratio than a principal residence. The down payment required can therefore be higher, and the lender may require an independent appraisal.",
          "The number of units, the actual use and the type of property also influence the decision. A divided co-ownership carries syndicate fees and rules to check before buying. A pre-purchase inspection and a reading of the syndicate minutes prevent costly surprises.",
        ],
      },
      {
        heading: "Return is not calculated on gross rent",
        paragraphs: [
          "Rent collected is not profit. You have to subtract municipal and school taxes, insurance, maintenance, repairs, management and vacancy periods.",
          "The local market determines the realistic rent and the vacancy risk. Two similar buildings in two different neighbourhoods do not offer the same return.",
          "The return calculation should stay conservative: it is better to underestimate net rent than to overestimate it. Rates, fees and penalties vary by lender, product and your file; confirm your situation with a mortgage broker or your lender.",
        ],
      },
      {
        heading: "The risks to name before borrowing",
        paragraphs: [
          "Leverage amplifies gains as well as losses. A rise in rates, a long vacancy or major repairs can turn a balanced project into a load that is hard to carry.",
          "Liquidity also matters: selling a rental property takes time and costs money. Keeping a reserve for the unexpected is part of a serious plan. An exit plan, even a rough one, helps you decide whether the investment holds up over several years.",
          "A mortgage broker can help you compare financing scenarios. The decision to invest is yours, and it depends on your tolerance for risk.",
        ],
      },
    ],
    checklist: [
      "Ask the lender how rental income will be counted in your file.",
      "Check the maximum loan-to-value ratio accepted for a rental property.",
      "Request an estimate of the appraisal, inspection and notary fees.",
      "Set aside a reserve for vacancy periods and repairs.",
      "Check the divided co-ownership rules, if applicable, before committing.",
    ],
    relatedSlugs: ["refinancer-pour-renover", "consolidation-de-dettes"],
  },
  {
    slug: "consolidation-de-dettes",
    navLabel: "Debt consolidation",
    title: "Debt consolidation: understand it before you borrow",
    metaTitle: "Debt consolidation: what to understand",
    metaDescription:
      "Consolidating all your debts into your mortgage can simplify payments, but it stretches the debt and often raises the total cost of interest.",
    intro: [
      "Debt consolidation means grouping several debts, often credit cards and personal loans, into a single mortgage debt or a loan secured by the house. The monthly payment sometimes drops, but the nature of the debt changes.",
      "That change deserves to be understood before signing, because it touches your home. A lower payment is not automatically a better deal.",
    ],
    sections: [
      {
        heading: "What consolidation solves, and what it does not",
        paragraphs: [
          "Grouping debts can simplify payments and lower the monthly payment. Consolidation does not reduce the debt itself, however: it moves it into a longer loan, often secured by the property.",
          "If the problem comes from a lack of income or from spending habits, consolidation postpones the difficulty rather than solving it. A realistic budget and an emergency fund often do more for stability than a new loan.",
        ],
      },
      {
        heading: "A debt secured by the house changes the risk",
        paragraphs: [
          "Credit cards and personal loans are generally unsecured. Once consolidated into the mortgage, they become secured by your home: a missed payment can lead to losing the housing.",
          "That is not a reason to rule out consolidation, but it is a reason to treat it seriously. The apparent flexibility of a lower payment has a cost. That cost is measured over time, not over the first month.",
          "Ask the lender which charges will be registered and how they will be discharged once the debt is repaid. That step has a cost and a delay.",
        ],
      },
      {
        heading: "Longer amortization and the total cost of interest",
        paragraphs: [
          "Stretching the debt over a longer period lowers the payment but raises the total interest paid. That is the point simulations often leave out.",
          "Ask for the total cost of credit over the whole period, not only the monthly payment. A lower payment says nothing about the debt remaining after a few years. Compare that total with what you would pay by repaying your current debts faster.",
          "You also have to plan for what happens if new debts are added after consolidation. A line of credit left open can recreate the initial situation. Closing repaid cards or reducing their limit is part of a consistent consolidation.",
        ],
      },
      {
        heading: "What the lender checks in a consolidation file",
        paragraphs: [
          "The lender analyses your income, your debts, your credit history and the equity available in the property. It also checks that the new loan meets its ratios and internal rules.",
          "A file refused today can be reworked: reducing the amount requested, repaying a small debt or waiting for the file to improve sometimes changes the decision. Bring recent statements and a complete list of your debts to the meeting.",
        ],
      },
      {
        heading: "When consolidation is not the right answer",
        paragraphs: [
          "If the debts far exceed the ability to repay, other options exist, such as budget counselling or the regimes set out in law. These questions go beyond the scope of an information site: talk to a qualified professional.",
          "A mortgage broker can explain the consequences of a loan secured by the house, but does not replace an insolvency advisor or a lawyer. For heavy situations, ask for a referral to a recognized resource. Ask for the answers in writing so you can compare them.",
          "Consolidation is not a budget plan on its own. Rates, fees and penalties vary by lender, product and your file; confirm your situation with a mortgage broker or your lender.",
        ],
      },
    ],
    checklist: [
      "Ask for the total cost of interest over the whole period, not just the monthly payment.",
      "Check whether the consolidated loan is secured by your home and what that means if you default.",
      "Ask which debts will be repaid and which ones will stay open.",
      "Check the prepayment conditions of the new loan.",
      "Ask a mortgage broker to compare consolidation with an unsecured line of credit.",
    ],
    relatedSlugs: ["renouvellement-hypothecaire", "refinancer-pour-investir"],
  },
  {
    slug: "separation-racheter-la-maison",
    navLabel: "Separation and buyout",
    title: "Separation: buying out the house without rushing",
    metaTitle: "Separation: buying out the house without rushing",
    metaDescription:
      "Buying out the house after a separation touches family patrimony and the lender's approval. Check these points before you sign an agreement.",
    intro: [
      "When a couple separates, the house quickly becomes the heaviest question. One person wants to stay, the other wants their share back, and the lender's timelines do not always match the pace of the separation.",
      "A buyout is possible, but it rests on legal and financial decisions that cannot be improvised. The steps rarely line up in the order you would wish.",
    ],
    sections: [
      {
        heading: "A decision for two, even when talking is hard",
        paragraphs: [
          "Sharing the family patrimony and the value of each person's rights fall under family law. A notary or a lawyer must be consulted before anything is signed, including an agreement between the two people.",
          "This page explains general concepts and does not replace legal advice. Amounts, deadlines and documents to produce vary with the situation. No verbal agreement should come before those checks.",
          "The emotional climate of a separation makes the math difficult. That is exactly why it is better to have the figures checked by professionals rather than rely on improvised estimates.",
        ],
      },
      {
        heading: "The buyout as the lender sees it",
        paragraphs: [
          "To buy the house, the person who stays generally has to become the sole borrower. The lender then reassesses the file with a single income, the existing debts and the family obligations, if any. It may also take support payments or another recurring obligation into account.",
          "Even if the agreement between the two people is clear, the lender has to approve the new profile. It can refuse or ask for a larger down payment, an appraisal or a guarantor.",
          "A refusal from the lender is not necessarily final. A larger contribution, a co-borrower or time to clean up the file can change the answer.",
        ],
      },
      {
        heading: "Equity is not automatically a down payment",
        paragraphs: [
          "The equity in the house is the market value minus the mortgage balance. Each person's share then depends on the sharing agreed or decided, which is why a written and validated agreement matters.",
          "If the person who stays has to pay a sum to the other, that payment can go through a refinance. The lender checks that the new loan stays sustainable after that payment. It may also require an appraisal to confirm the value used in the sharing.",
        ],
      },
      {
        heading: "The notary's role and the written record",
        paragraphs: [
          "A notarized deed is often needed to formalize the transfer, the discharge or the removal of a charge. Those steps are not done by a simple exchange of emails.",
          "Ask for an estimate of the fees and the timelines before committing. Missing documents are a frequent cause of delay. A clear notarized deed protects both people, even when the relationship is already over.",
        ],
      },
      {
        heading: "Protecting what comes next, not only the transaction",
        paragraphs: [
          "After the buyout, the budget has to hold on a single income: mortgage, municipal taxes, insurance, maintenance and the unexpected. An optimistic calculation today can become a lasting constraint. A cautious budget is better than a buyout followed by new debt.",
          "Take the time to compare scenarios, including selling. Sometimes selling and starting again on a lighter footing is the healthiest solution for both people. That option is not a failure; it is sometimes the fairest way to share the value.",
          "A decision made in a hurry is hard to correct. Rates, fees and penalties vary by lender, product and your file; confirm your situation with a mortgage broker or your lender.",
        ],
      },
    ],
    checklist: [
      "Get a written appraisal of the market value before setting each person's share.",
      "Check with the lender whether your income alone can carry the mortgage.",
      "Ask the notary for an estimate of the fees, the documents and the timelines.",
      "Confirm the exact mortgage balance and the penalties tied to a prepayment.",
      "Have a lawyer or a notary confirm the sharing of family patrimony before signing.",
      "Ask for a written simulation of the monthly budget on a single income.",
    ],
    relatedSlugs: ["vendre-ou-renover", "renouvellement-hypothecaire"],
  },
  {
    slug: "vendre-ou-renover",
    navLabel: "Sell or renovate",
    title: "Sell or renovate: compare the real costs before deciding",
    metaTitle: "Sell or renovate: compare the real costs",
    metaDescription:
      "Sell or renovate? Compare the transaction costs, the cost of the work, the permits and the timelines before choosing the best option for your house.",
    intro: [
      "Selling or renovating is not only a matter of taste. Both options involve different costs, timelines and risks, and the right answer depends on your neighbourhood, your budget and your horizon.",
      "Comparing scenarios with plausible figures beats deciding on an impression. A gap of a few weeks in the schedule can change the math.",
    ],
    sections: [
      {
        heading: "Two projects, two cost structures",
        paragraphs: [
          "Selling involves transaction costs: the real estate broker's remuneration, notary fees, moving and sometimes a mortgage penalty. Transfer duties, often called the welcome tax, are paid by the buyer, but they weigh on the price the buyer can offer. Those costs are calculated before the listing, not after the sale.",
          "Renovating involves the cost of the work, the permits, the inspection and the delays. A major renovation can also require temporarily leaving the home.",
          "The two options can also combine: some owners renovate the essential elements, then sell with a stronger file. In that case, you have to check that the work will be finished before the listing.",
        ],
      },
      {
        heading: "What renovation changes about value",
        paragraphs: [
          "Not every renovation turns into resale value. Buyers pay for what they can see: a functional kitchen, a sound bathroom, a roof in good condition. Invisible work protects value without raising it dramatically. A well-maintained house generally sells more easily than a recently renovated house that is poorly finished.",
          "A renovation above the standard of the area can be hard to recoup. Look at comparable properties before setting a budget. A real estate broker in the area can tell you what buyers actually look for.",
        ],
      },
      {
        heading: "Transaction costs you discover too late",
        paragraphs: [
          "On top of the known fees, you have to plan for tax adjustments, insurance, work required by the pre-purchase inspection and sometimes a negotiated price reduction. Those items reduce the net proceeds of the sale.",
          "Conversely, a renovation project has its own surprises: bad discoveries behind the walls, permit delays, contractor availability. A contingency reserve is not a luxury.",
          "Ask for written quotes and keep a margin for the unexpected. The most expensive work is often the work you had not planned for.",
        ],
      },
      {
        heading: "Permits, co-ownership and rules to check",
        paragraphs: [
          "Work that touches the structure, the electricity, the plumbing or the building envelope often requires a municipal permit. In a divided co-ownership, the syndicate can also govern changes and work hours. Rules vary from one municipality and one co-ownership to another.",
          "Having those rules checked before ordering materials avoids useless spending. A licensed and insured contractor also reduces the risk of poor workmanship. A site without a permit can be stopped, which delays the sale or the rental listing.",
        ],
      },
      {
        heading: "How to decide with numbers",
        paragraphs: [
          "The useful calculation compares the net proceeds of a sale with the real cost of a renovation and the estimated value after the work. It accounts for the timelines, the local market and your tolerance for risk.",
          "None of those figures is certain. Rates, fees and penalties vary by lender, product and your file; confirm your situation with a mortgage broker or your lender.",
          "Getting help from a mortgage broker and, if needed, from an appraiser lets you test the scenarios before making a costly decision. That step does not guarantee an outcome, but it makes the trade-offs more visible.",
        ],
      },
    ],
    checklist: [
      "Get an estimate of the selling costs, including the broker's remuneration and the notary fees.",
      "Confirm the real cost of the work with written quotes, permits included.",
      "Ask the municipality whether your project requires a permit or a variance.",
      "Check with the lender the penalty tied to a prepayment if you sell.",
      "Compare the net proceeds of the sale with the estimated value of the house after renovation.",
      "Ask for a written schedule for the work, with the required permits and inspections.",
    ],
    relatedSlugs: ["renouvellement-hypothecaire", "refinancer-pour-renover"],
  },
];
