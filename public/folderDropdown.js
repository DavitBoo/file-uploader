const dropdownFolderOptions = document.querySelectorAll('.dropdown-folder-options');
  const dropdownBoxes = document.querySelectorAll('.dropdownBox');

  dropdownFolderOptions.forEach((option, index) => {
    option.addEventListener('click', () => {
      dropdownBoxes[index].classList.toggle('show');
    });
  });

  window.addEventListener('click', (event) => {
      dropdownBoxes.forEach((box) => {
          // I am little confuse here but it works 😅
          if (box.contains(event.target) && !event.target.classList.contains('dropdown-folder-options')) {
          console.log(box);
        box.classList.toggle('show');
      }
    });
  });