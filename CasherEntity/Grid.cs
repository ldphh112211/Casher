using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CasherEntity
{
    public class Grid<T> {
        public int total;
        public List<T> rows = new List<T>();
    }
}
