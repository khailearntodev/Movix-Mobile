import { Person } from '../types/person';

export const mockPeople: Person[] = [
  {
    id: 1100,
    name: "Arnold Schwarzenegger",
    role: "Acting",
    profilePath: "/zEMMy_r6nJg.jpg", 
    biography: "Arnold Alois Schwarzenegger là một nam diễn viên, doanh nhân, nhà làm phim và cựu chính trị gia người Mỹ gốc Áo, từng giữ chức thống đốc thứ 38 của California từ năm 2003 đến năm 2011.",
    placeOfBirth: "Thal, Styria, Áo",
    birthday: "1947-07-30",
    gender: 2,
    credits: [
        { id: 218, title: "Kẻ Hủy Diệt", posterPath: "/hzXSE66v6KthZ8nPoIDkLQ1KKjZ.jpg", character: "Kẻ Hủy Diệt", mediaType: "movie", year: "1984" },
        { id: 280, title: "Kẻ Hủy Diệt 2: Ngày Phán Xét", posterPath: "/5M0j0B18abtBI5TfZOleoCnYufM.jpg", character: "Kẻ Hủy Diệt", mediaType: "movie", year: "1991" },
    ]
  },
   {
      id: 500,
      name: "Tom Cruise",
      role: "Acting",
      profilePath: "/8qBylBsQf4llkGrWR3qAsOtOU8O.jpg",
      biography: "Tom Cruise là một nam diễn viên và nhà sản xuất phim người Mỹ. Anh bắt đầu sự nghiệp của mình ở tuổi 19 với bộ phim Endless Love (1981).",
      placeOfBirth: "Syracuse, New York, Mỹ",
      birthday: "1962-07-03",
      gender: 2,
      credits: [
        { id: 744, title: "Phi Công Siêu Đẳng", posterPath: "/xUuHj3Cgmw9ia75UypPW36660nq.jpg", character: "Lt. Pete 'Maverick' Mitchell", mediaType: "movie", year: "1986" },
        { id: 954, title: "Nhiệm Vụ Bất Khả Thi", posterPath: "/AhMCvJjW98Wp2pC01U1k8R0KqM.jpg", character: "Ethan Hunt", mediaType: "movie", year: "1996" },
      ]
  },
];
