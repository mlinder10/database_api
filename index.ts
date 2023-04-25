import axios from "axios";

type BaseDocType = {
  id: number;
};

export default class Cluster<T> {
  root: string;
  project: string;
  name: string;

  constructor(root: string, project: string, name: string) {
    this.root = root;
    this.project = project;
    this.name = name;
  }

  async init(): Promise<string> {
    let ret = "Created: ";
    try {
      let proj = await axios.get(`${this.root}/${this.project}`);
      if (proj.data === null) {
        await axios.post(`${this.root}/${this.project}`);
        ret += "Project ";
      }
      let clus = await axios.get(`${this.root}/${this.project}/${this.name}`);
      if (clus.data === null) {
        await axios.post(`${this.root}/${this.project}/${this.name}`);
        ret += "Cluster ";
      }
      return ret;
    } catch (err: any) {
      console.log(err?.message);
      return "Error";
    }
  }

  async readAllDocs(): Promise<(T & BaseDocType)[]> {
    try {
      let res = await axios.get(`${this.root}/${this.project}/${this.name}`);
      return res.data;
    } catch (err: any) {
      console.error(err?.message);
      return [];
    }
  }

  async readOneDoc(
    key: string,
    value: any
  ): Promise<(T & BaseDocType) | undefined> {
    try {
      let res = await axios.get(`${this.root}/${this.project}/${this.name}`);
      for (let d of res.data) {
        if (d[key] == value) return d;
      }
      return undefined;
    } catch (err: any) {
      console.error(err?.message);
      return undefined;
    }
  }

  async createDoc(doc: T): Promise<(T & BaseDocType)[]> {
    try {
      let res = await axios.post(
        `${this.root}/${this.project}/${this.name}/${this.createID()}`,
        {
          data: doc,
        }
      );
      return res.data;
    } catch (err: any) {
      console.error(err?.message);
      return [];
    }
  }

  async removeOneDoc(id: string): Promise<string> {
    try {
      let res = await axios.delete(
        `${this.root}/${this.project}/${this.name}/${id}`
      );
      return res.data;
    } catch (err: any) {
      console.error(err?.message);
      return "Error";
    }
  }

  async removeManyDocs(key: string, value: any): Promise<string> {
    try {
      let count = 0;
      let res = await axios.get(`${this.root}/${this.project}/${this.name}`);
      for (let d of res.data) {
        if (d[key] == value) {
          await this.removeOneDoc(d.id);
          count++;
        }
      }
      return `Delete Count: ${count}`;
    } catch (err: any) {
      console.error(err?.message);
      return "Error";
    }
  }

  async updateDoc(
    id: string,
    doc: T | (T & BaseDocType)
  ): Promise<(T & BaseDocType)[]> {
    try {
      await this.removeOneDoc(id);
      let docs = await this.createDoc(doc);
      return docs;
    } catch (err: any) {
      console.error(err?.message);
      return [];
    }
  }

  private createID() {
    return Math.floor(Math.random() * 1_000_000_000);
  }
}
