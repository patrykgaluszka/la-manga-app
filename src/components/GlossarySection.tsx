interface GlossaryItem {
  phrase: string;
  translation: string;
  pronunciation?: string;
}

interface Section {
  section: string;
  id: string;
  items: GlossaryItem[];
}

interface GlossarySectionProps {
  sections: Section[];
}

export default function GlossarySection({ sections }: GlossarySectionProps) {
  return (
    <>
      {sections.map((section) => (
        <div key={section.id}>
          <h2 id={section.id} className="text-2xl font-bold text-gray-800 mb-6 mt-8">
            {section.section}
          </h2>
          {section.items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 mb-3 border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="text-left">
                  <div className="font-semibold text-gray-800 text-lg mb-1">
                    {item.phrase}
                  </div>
                  {item.pronunciation && (
                    <div className="text-sm text-gray-500 italic">
                      [{item.pronunciation}]
                    </div>
                  )}
                </div>
                
                <div className="text-left sm:text-right">
                  <div className="text-ocean-700 font-medium text-lg">
                    {item.translation}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}