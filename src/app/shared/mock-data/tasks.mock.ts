import { TaskModel } from "@svp-models";

export const tasksMock: TaskModel[] = [
  {
    id: 1,
    type: "Epic",
    summary: "Task 1",
    description: "Task 1 Description",
    status: "COMPLETED",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 1,
      firstName: "John",
      lastName: "Doe",
    }
  },
  {
    id: 2,
    type: "Task",
    summary: "My very long task string is here because I need to test a longer task summary.",
    description: "Task 2 Description",
    status: "IN PROGRESS",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
    }
  },
  {
    id: 3,
    type: "Task",
    summary: "Task 3",
    description: "Task 3 Description",
    status: "TO DO",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 3,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  },
  {
    id: 4,
    type: "Epic",
    summary: "Task 4",
    description: "Task 4 Description",
    status: "TO DO",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 4,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  },
  {
    id: 5,
    type: "Task",
    summary: "Task 5",
    description: "Task 5 Description",
    status: "TO DO",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 5,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  },
  {
    id: 6,
    type: "Task",
    summary: "Task 6",
    description: "Task 6 Description",
    status: "TO DO",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 6,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  },
  {
    id: 7,
    type: "Task",
    summary: "Task 7",
    description: "Task 7 Description",
    status: "TO DO",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 7,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  },
  {
    id: 8,
    type: "Task",
    summary: "Task 8",
    description: "Task 8 Description",
    status: "IN PROGRESS",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 8,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  },
  {
    id: 9,
    type: "Task",
    summary: "Task 9",
    description: "Task 9 Description",
    status: "TO DO",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 9,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  },
  {
    id: 10,
    type: "Task",
    summary: "Task 10",
    description: "Task 10 Description",
    status: "COMPLETED",
    createdAt: new Date(),
    dueDate: new Date(),
    reporter: {
      id: 10,
      firstName: "Bukky",
      lastName: "Omoge",
    }
  }
]
