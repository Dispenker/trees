using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Web_graph
{
    public static class DBConnector
    {
        public const string ConnectionString = "server=127.0.0.1;user=web;database=web_graph;password=webConnect;SSL Mode=None;port=3306";

        public static T[] Connect<T>() where T : Entity
        {
            try
            {
                var connection = new MySqlConnection(ConnectionString);
                connection.Open();

                var command = connection.CreateCommand();

                command.CommandText = $"select * from entities;";

                var result = new List<T>();

                using (var reader = command.ExecuteReader())
                {
                    var columns = Enumerable.Range(0, reader.FieldCount).Select(reader.GetName).ToArray();
                    var properties = typeof(T).GetProperties();

                    while (reader.Read())
                    {
                        var data = new object[reader.FieldCount];
                        reader.GetValues(data);

                        var instance = (T)Activator.CreateInstance(typeof(T));

                        for (var i = 0; i < data.Length; ++i)
                        {
                            if (data[i] == DBNull.Value)
                            {
                                data[i] = null;
                            }

                            var property = properties.SingleOrDefault(x => x.Name.Equals(columns[i], StringComparison.InvariantCultureIgnoreCase));

                            if (property != null)
                            {
                                property.SetValue(instance, Convert.ChangeType(data[i], property.PropertyType));
                            }
                        }
                        result.Add(instance);
                    }
                }
                connection.Close();

                return result.ToArray();
            } catch (Exception ex)
            {
                T[] res = new T[1];
                res[0] = (T)Activator.CreateInstance(typeof(T));
                res[0].JsObject = ex.Message;
                return res;
            }
        }
    }
}
