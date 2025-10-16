import { useState, useEffect } from 'react';

interface Section<T> {
  section: string;
  id: string;
  items: Array<T>;
}

interface SectionsMenuProps<T> {
  sections?: Section<T>[];
}

export default function SectionsMenu<T>({ sections }: SectionsMenuProps<T>) {
  const [dynamicSections, setDynamicSections] = useState<Array<{section: string, id: string}>>([]);

  useEffect(() => {
    if (!sections) {
      const findSections = () => {
        // Find all h2 elements in the main tag
        const mainElement = document.querySelector('main');
        if (mainElement) {
          const h2Elements = mainElement.querySelectorAll('h2');
          if (h2Elements.length > 0) {
            const foundSections = Array.from(h2Elements).map((h2) => ({
              section: h2.textContent || '',
              id: h2.id || h2.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || ''
            }));
            
            // Add ids to h2 elements that don't have them
            h2Elements.forEach((h2) => {
              if (!h2.id && h2.textContent) {
                h2.id = h2.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              }
            });
            
            setDynamicSections(foundSections);
          } else {
            // If no h2 elements found, try again after a short delay
            setTimeout(findSections, 100);
          }
        }
      };

      // Try immediately and also after DOM is fully loaded
      findSections();
      
      // Also try after a short delay to ensure MDX content is rendered
      const timeoutId = setTimeout(findSections, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [sections]);

  const sectionsToRender = sections || dynamicSections;


  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
      <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sectionsToRender.map((section) => (
          <a 
            key={section.id}
            href={`#${section.id}`} 
            className="text-ocean-600 hover:text-ocean-700 hover:underline py-1"
          >
            → {section.section}
          </a>
        ))}
      </nav>
    </div>
  );
}