import React, { useEffect, useRef } from 'react';
import Packery from 'packery';

const Repositorys = ({ repos, tagHovered,setTagHovered,loading,colors }) => {
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
            ${((!repo.tags.some(tag => tag.tag === tagHovered) && !Object.keys(repo.languages).includes(tagHovered)) && tagHovered != "") && "filtered-out"}
            ${loading && 'load'}`} 
          style={{animationDelay: `${(index/repos.length)*0.5}s`,minHeight: `${100+repo.height}px`}}
          target='blank'>
            <a href={repo.link}>{repo.name}</a>
            <div className='tags'>
              {repo.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className={`tag ${(tagHovered == tag.tag)&&'filter'}`} 
                style={{backgroundColor: colors[tag.tag]}}
                onMouseEnter={(e) => setTagHovered(tag.tag)}
                onMouseLeave={(e) => setTagHovered("")}>
                  {tag.tag}
                  <div className='desc'>{tag.desc}</div>
                </span>
              ))}
            </div>
            <div className='languages'>
              {repo.languages && Object.entries(repo.languages).map(([lang, bytes], langIndex) => (
                <span key={langIndex} className={`tag ${(tagHovered == lang)&&'filter'}`} 
                style={{backgroundColor: colors[lang]}}
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
