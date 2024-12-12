import React, { useEffect, useRef } from 'react';
import Packery from 'packery';

const Repositorys = ({ repos, tagHovered,setTagHovered }) => {
  const packeryRef = useRef(null);

  useEffect(() => {
    const packery = new Packery(packeryRef.current, {
      itemSelector: '.repo',
      gutter: 10,
    });

    setTimeout(() => {
        const packery = new Packery(packeryRef.current, {
            itemSelector: '.repo',
            gutter: 10,
          });
      
          // Re-layout after content changes
          return () => {
            packery.layout();
          };
    }, 500);

    // Re-layout after content changes
    return () => {
      packery.layout();
    };
  }, [repos]);


  return (
    <div ref={packeryRef} className="repos">
       {repos.map((repo, index) => (
          <div key={index} className={`repo 
            ${((!repo.tags.includes(tagHovered) && !Object.keys(repo.languages).includes(tagHovered)) && tagHovered != "") && "filtered-out"}`} 
          style={{animationDelay: `${(index/repos.length)*0.5}s`,minHeight: `${150+repo.height}px`}}>
            <h2>{repo.name}</h2>
            <div className='tags'>
              {repo.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className={`tag ${(tagHovered == tag)&&'filter'}`} 
                style={{backgroundColor: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`}}
                onMouseEnter={(e) => setTagHovered(tag)}
                onMouseLeave={(e) => setTagHovered("")}>
                  {tag}</span>
              ))}
            </div>
            <div className='languages'>
              {repo.languages && Object.entries(repo.languages).map(([lang, bytes], langIndex) => (
                <span key={langIndex} className={`tag language ${(tagHovered == lang)&&'filter'}`} 
                style={{borderColor: `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`}}
                onMouseEnter={(e) => setTagHovered(lang)}
                onMouseLeave={(e) => setTagHovered("")}>
                {lang}</span>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default Repositorys;
