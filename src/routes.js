import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";
import { formatarDataParaString } from "./utils/formatar-data-para-string.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;
      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } =
        req.body;

      if(!title || !description){
        const responseObject = {
            message: "Parâmetros invalidos!",
          };
          return res.writeHead(400).end(JSON.stringify(responseObject));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: formatarDataParaString(new Date()),
        updated_at: formatarDataParaString(new Date()),
      };

 

        database.insert("tasks", task);


      return res.writeHead(201).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select('tasks', { id })

      if (!task) {
        const responseObject = {
            message: "ID inválido",
          };
          return res.writeHead(400).end(JSON.stringify(responseObject));
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (title || description) {
        const [task] = database.select('tasks', { id })

        if (!task) {
          const responseObject = {
              message: "ID inválido",
            };
            return res.writeHead(400).end(JSON.stringify(responseObject));
        }

        let options = {};
        if (title && description) {
          options = {
            title,
            description,
            updated_at: formatarDataParaString(new Date()),
          };
        } else if (title) {
          options = {
            title,
            updated_at: formatarDataParaString(new Date()),
          };
        } else if (description) {
          options = {
            description,
            updated_at: formatarDataParaString(new Date()),
          };
        }
        database.update("tasks", id, options);

        return res.writeHead(204).end();
      } else {
        const responseObject = {
          message:
            "Parâmetro description ou title não é válido, task não atualizada",
        };
        return res.writeHead(400).end(JSON.stringify(responseObject));
      }
    },
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params

      const [task] = database.select('tasks', { id })

      if (!task) {
        const responseObject = {
            message: "ID inválido",
          };
          return res.writeHead(400).end(JSON.stringify(responseObject));
      }

      const isTaskCompleted = !!task.completed_at
      const completed_at = isTaskCompleted ? null : formatarDataParaString(new Date())

      database.update('tasks', id, { completed_at })

      return res.writeHead(204).end()
    }
  }
];
