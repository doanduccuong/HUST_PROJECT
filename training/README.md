# C2FPW-RecFac
This is a public repository called Clinical Cosmetic Facial Procedures in the Wild (C2FPW). It contains images in different ages of people that undergone cosmetic voluntary interventions on their faces. The pourpouse of this image collection is for studies in Facial Recognition. The image dataset was created by the authors with links to images of celebrities and other public figures who declared having undergone facial plastic surgery or some aesthetic procedures, or an specialist confirmed this information. The dataset consists of 90 subjects, with the number of images per subject ranging from 15 to 69 throughout their lives. In total, the dataset contains 3056 images.

The file names follow the format SXXX_YYYY_AAAA_B_C, where XXX represents the subject's number in the database, YYYY represents the subject's year of birth, AAAA represents the year the photo was taken, B indicates the subject's gender ('F' for female and 'M' for male), and C has two options: 'A' if the subject admitted having performed the aesthetic procedure, or 'E' if a specialist confirmed the information.

The images were sourced from the internet and are in the public domain. However, only the links to the images are stored in the repository, specifically in the 'C2FPW.csv' file. Some images required cropping to isolate the desired subject, while others needed to be extracted from videos or other files. To indicate these actions, a column named 'Cropped' has been added to the link's file (C2FPW.csv), indicating whether an image needed to be cropped ('Yes') or if it was used as-is ('No').

To download the image dataset, execute the script 'C2FPW-Download.py'. Please note that since these are public links, some may become inactive over time. During the download process, any errors resulting from URLs that do not allow image downloads will be recorded in the 'error-log.txt' file, which will be created in the same directory as the C2FPW folder containing the images.

## Autors: 
Fernanda Vaz Borges Carneiro - fernandavazbc@gmail.com - Mechatronics Engineering - University of Brasilia (UnB).
Liz Carolina Jaber Costato - lizcostato@gmail.com - Mechatronics Engineering - University of Brasilia (UnB).

## Citation: 
Please cite C2FPW in your publications, if it was used in your research. Here are its BibTex entries:

@masterthesis{C2FPW-RecFac,
    author = {Carneiro F., Costato, L.},
    title = {Avaliando o impacto das modificações faciais voluntárias em modelos de aprendizagem profunda no reconhecimento facial},
    school = {University of Brasília (UnB)},
    address = {Brasília, Brasil},
    year = {2023},
    type={Bachelor's Thesis}
}
